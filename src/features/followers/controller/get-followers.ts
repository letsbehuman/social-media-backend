import { IFollowerData } from '@followers/interfaces/follower.interface';
import { followerService } from '@services/db/follower.services';
import { FollowerCache } from '@services/redis/follower.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

const followerCache: FollowerCache = new FollowerCache();

export class GetFollower {
  public async userFollowing(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.currentUser!.userId);
    const cacheFollowees: IFollowerData[] = await followerCache.getFollowersFromCache(
      `following:${req.currentUser!.userId}`
    );

    const following: IFollowerData[] = cacheFollowees.length
      ? cacheFollowees
      : await followerService.getFolloweeData(userObjectId);
    res.status(HTTP_STATUS.OK).json({ message: 'User following', following: following });
  }

  public async userFollowers(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.params.userId);
    const cacheFollowers: IFollowerData[] = await followerCache.getFollowersFromCache(`followers:${req.params.userId}`);
    const followers: IFollowerData[] = cacheFollowers.length
      ? cacheFollowers
      : await followerService.getFollowerData(userObjectId);
    res.status(HTTP_STATUS.OK).json({ message: 'User followers', followers: followers });
  }
}
