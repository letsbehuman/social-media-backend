import { IFollowerData } from '@followers/interfaces/follower.interface';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { FollowerCache } from '@services/redis/follower.cache';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import mongoose from 'mongoose';

const followerCache: FollowerCache = new FollowerCache();
const userCache: UserCache = new UserCache();

export class AddFollow {
  public async follower(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;
    //update count in cache
    const followersCount: Promise<void> = followerCache.updateFollowerCountInCache(
      `${followerId}`,
      'followersCount',
      1
    );
    const followeeCount: Promise<void> = followerCache.updateFollowerCountInCache(
      `${req.currentUser?.userId}`,
      'followingCount',
      1
    );
    await Promise.all([followersCount, followeeCount]);

    const cacheFollower: Promise<IUserDocument> = userCache.getUserFromCache(followerId) as Promise<IUserDocument>;
    const cacheFollowee: Promise<IUserDocument> = userCache.getUserFromCache(
      `${req.currentUser?.userId}`
    ) as Promise<IUserDocument>;
    const response: [IUserDocument, IUserDocument] = await Promise.all(cacheFollower, cacheFollowee);
    const followerObjectId: ObjectId = new ObjectId();
    const addFolloweeData: IFollowerData = AddFollow.prototype.userData(response[0]);
    // send data to client with socketIO

    const addFollowerToCache: Promise<void> = followerCache.saveFollowerToCache(
      `followers:${req.currentUser!.userId}`,
      `${followerId}`
    );
    const addFolloweeToCache: Promise<void> = followerCache.saveFollowerToCache(
      `following:${followerId}`,
      `${req.currentUser!.userId}`
    );
    await Promise.all([addFollowerToCache, addFolloweeToCache]);
    //send date to queue
    res.status(HTTP_STATUS.OK).json({ message: 'Following user now' });
  }

  private userData(user: IUserDocument): IFollowerData {
    return {
      _id: new mongoose.Types.ObjectId(user._id),
      username: user.username!,
      avatarColor: user.avatarColor!,
      postCount: user.postsCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profilePicture: user.profilePicture,
      uId: user.uId!,
      userProfile: user
    };
  }
}
