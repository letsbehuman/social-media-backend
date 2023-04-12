import { FollowerModel } from '@followers/models/follower.schema';
import { UserModel } from '@user/models/user.schema';
import { ObjectId, BulkWriteResult } from 'mongodb';
import mongoose, { Query } from 'mongoose';
import { IFollowerDocument } from '@followers/interfaces/follower.interface';
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
}
export const followerService: FollowerService = new FollowerService();
