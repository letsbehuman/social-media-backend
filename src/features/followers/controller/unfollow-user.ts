import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { FollowerCache } from '@services/redis/follower.cache';
import { followerQueue } from '@services/queues/follower.queue';

const followerCache: FollowerCache = new FollowerCache();

export class RemoveFollow {
  public async follower(req: Request, res: Response): Promise<void> {
    const { followeeId, followerId } = req.params;
    //update count in cache
    const removeFollowerFromCache: Promise<void> = followerCache.removeFollowerFromCache(
      `following:${req.currentUser!.userId}`,
      followeeId
    );
    const removeFolloweeFromCache: Promise<void> = followerCache.removeFollowerFromCache(
      `followers:${followeeId}`,
      followerId
    );

    const followerCount: Promise<void> = followerCache.updateFollowerCountInCache(
      `${followeeId}`,
      'followersCount',
      -1
    );
    const followeeCount: Promise<void> = followerCache.updateFollowerCountInCache(
      `${followerId}`,
      'followingCount',
      -1
    );

    await Promise.all([removeFollowerFromCache, removeFolloweeFromCache, followeeCount, followerCount]);

    //sending data to queue
    followerQueue.addFollowerJob('removeFollowerFromDB', {
      followeeId: `${followeeId}`,
      followerId: `${followerId}`
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Unfollowed user now' });
  }
}
