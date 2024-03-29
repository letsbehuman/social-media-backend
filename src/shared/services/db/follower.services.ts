import { FollowerModel } from '@followers/models/follower.schema';
import { UserModel } from '@user/models/user.schema';
import { ObjectId, BulkWriteResult } from 'mongodb';
import mongoose, { Query } from 'mongoose';
import { IFollowerData, IFollowerDocument } from '@followers/interfaces/follower.interface';
import { IQueryDeleted, IQueryComplete } from '@post/interfaces/post.interface';

class FollowerService {
  public async addFollowerToDB(
    followerId: string,
    followeeId: string,
    username: string,
    followerDocumentId: ObjectId
  ): Promise<void> {
    const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);
    const followerObjectId: ObjectId = new mongoose.Types.ObjectId(followerId);

    await FollowerModel.create({
      _id: followerDocumentId,
      followerId: followerObjectId,
      followeeId: followeeObjectId
    });

    const updatingUsers: Promise<BulkWriteResult> = UserModel.bulkWrite([
      {
        updateOne: { filter: { _id: followerId }, update: { $inc: { followingCount: 1 } } }
      },
      {
        updateOne: { filter: { _id: followeeId }, update: { $inc: { followersCount: 1 } } }
      }
    ]); //update multiple documents in the same collection
    await Promise.all([updatingUsers, UserModel.findOne({ _id: followeeId })]);
  }

  public async removeFollowerFormDB(followeeId: string, followerId: string): Promise<void> {
    const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);
    const followerObjectId: ObjectId = new mongoose.Types.ObjectId(followerId);

    const unfollow: Query<IQueryComplete & IQueryDeleted, IFollowerDocument> = FollowerModel.deleteOne({
      followeeId: followeeObjectId,
      followerId: followerObjectId
    });
    const updatingUsers: Promise<BulkWriteResult> = UserModel.bulkWrite([
      {
        updateOne: { filter: { _id: followerId }, update: { $inc: { followingCount: -1 } } }
      },
      {
        updateOne: { filter: { _id: followeeId }, update: { $inc: { followersCount: -1 } } }
      }
    ]); //update multiple documents in the same collection
    await Promise.all([unfollow, updatingUsers]);
  }

  public async getFolloweeData(userObjectId: ObjectId): Promise<IFollowerData[]> {
    const followee = await FollowerModel.aggregate([
      { $match: { followerId: userObjectId } },
      { $lookup: { from: 'User', localField: 'followeeId', foreignField: '_id', as: 'followeeId' } },
      { $unwind: '$followeeId' },
      { $lookup: { from: 'Auth', localField: 'followeeId.authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      {
        $addFields: {
          _id: '$followeeId._id',
          username: '$authId.username',
          avatarColor: '$authId.avatarColor',
          uId: '$authId.uId',
          postCount: '$followeeId.postCount',
          followersCount: '$followeeId.followersCount',
          followingCount: '$followeeId.followingCount',
          profilePicture: '$followeeId.profilePicture',
          userProfile: '$followeeId'
        }
      },
      {
        $project: {
          authId: 0,
          followerId: 0,
          followeeId: 0,
          createdAt: 0,
          __v: 0
        } //not including this info
      }
    ]);
    return followee;
  }
  public async getFollowerData(userObjectId: ObjectId): Promise<IFollowerData[]> {
    const follower = await FollowerModel.aggregate([
      { $match: { followeeId: userObjectId } },
      { $lookup: { from: 'User', localField: 'followerId', foreignField: '_id', as: 'followerId' } },
      { $unwind: '$followerId' },
      { $lookup: { from: 'Auth', localField: 'followerId.authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      {
        $addFields: {
          _id: '$followerId._id',
          username: '$authId.username',
          avatarColor: '$authId.avatarColor',
          uId: '$authId.uId',
          postCount: '$followerId.postCount',
          followersCount: '$followerId.followersCount',
          followingCount: '$followerId.followingCount',
          profilePicture: '$followerId.profilePicture',
          userProfile: '$followerId'
        }
      },
      {
        $project: {
          authId: 0,
          followerId: 0,
          followeeId: 0,
          createdAt: 0,
          __v: 0
        } //not including this info
      }
    ]);
    return follower;
  }
}
export const followerService: FollowerService = new FollowerService();
