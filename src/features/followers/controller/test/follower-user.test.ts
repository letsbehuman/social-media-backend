import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { authUserPayload } from '@root/mocks/auth.mock';
import * as followerServer from '@sockets/follower.socket';
import { followersMockRequest, followersMockResponse } from '@root/mocks/followers.mock';
import { existingUser } from '@root/mocks/user.mock';
import { followerQueue } from '@services/queues/follower.queue';
import { AddFollow } from '@followers/controller/follower-user';
import { UserCache } from '@services/redis/user.cache';
import { FollowerCache } from '@services/redis/follower.cache';

jest.useFakeTimers();
jest.mock('@services/queues/base.queue');
jest.mock('@services/redis/user.cache');
jest.mock('@services/redis/follower.cache');

Object.defineProperties(followerServer, {
  socketIOFollowerObject: {
    value: new Server(),
    writable: true
  }
});

describe('AddFollow', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('follower', () => {
    it('should call updateFollowersCountInCache', async () => {
      const req: Request = followersMockRequest({}, authUserPayload, {
        followerId: '6064861bc25eaa5a5d2f9bf4'
      }) as Request;
      const res: Response = followersMockResponse();
      jest.spyOn(FollowerCache.prototype, 'updateFollowerCountInCache');
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);

      await AddFollow.prototype.follower(req, res);
      expect(FollowerCache.prototype.updateFollowerCountInCache).toHaveBeenCalledTimes(2);
      expect(FollowerCache.prototype.updateFollowerCountInCache).toHaveBeenCalledWith(
        '6064861bc25eaa5a5d2f9bf4',
        'followersCount',
        1
      );
      expect(FollowerCache.prototype.updateFollowerCountInCache).toHaveBeenCalledWith(
        `${existingUser._id}`,
        'followingCount',
        1
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Following user now'
      });
    });

    it('should call saveFollowerToCache', async () => {
      const req: Request = followersMockRequest({}, authUserPayload, {
        followerId: '6064861bc25eaa5a5d2f9bf4'
      }) as Request;
      const res: Response = followersMockResponse();
      jest.spyOn(followerServer.socketIOFollowerObject, 'emit');
      jest.spyOn(FollowerCache.prototype, 'saveFollowerToCache');
      jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(existingUser);

      await AddFollow.prototype.follower(req, res);
      expect(UserCache.prototype.getUserFromCache).toHaveBeenCalledTimes(2);
      expect(FollowerCache.prototype.saveFollowerToCache).toHaveBeenCalledTimes(2);
      expect(FollowerCache.prototype.saveFollowerToCache).toHaveBeenCalledWith(
        `following:${req.currentUser!.userId}`,
        '6064861bc25eaa5a5d2f9bf4'
      );
      expect(FollowerCache.prototype.saveFollowerToCache).toHaveBeenCalledWith(
        'followers:6064861bc25eaa5a5d2f9bf4',
        `${existingUser._id}`
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Following user now'
      });
    });

    it('should call followerQueue addFollowerJob', async () => {
      const req: Request = followersMockRequest({}, authUserPayload, {
        followerId: '6064861bc25eaa5a5d2f9bf4'
      }) as Request;
      const res: Response = followersMockResponse();
      const spy = jest.spyOn(followerQueue, 'addFollowerJob');

      await AddFollow.prototype.follower(req, res);
      expect(followerQueue.addFollowerJob).toHaveBeenCalledWith('addFollowerToDB', {
        followeeId: `${req.currentUser?.userId}`,
        followerId: '6064861bc25eaa5a5d2f9bf4',
        username: req.currentUser?.username,
        followerDocumentId: spy.mock.calls[0][1].followerDocumentId
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Following user now'
      });
    });
  });
});
