import { AddFollow } from '@followers/controller/follower-user';
import { GetFollower } from '@followers/controller/get-followers';
import { RemoveFollow } from '@followers/controller/unfollow-user';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';

class FollowerRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.put('/user/follow/:followerId', authMiddleware.checkAuthentication, AddFollow.prototype.follower);
    this.router.put(
      '/user/unfollow/:followeeId/:followerId',
      authMiddleware.checkAuthentication,
      RemoveFollow.prototype.follower
    );
    this.router.get('/user/following', authMiddleware.checkAuthentication, GetFollower.prototype.userFollowing);
    this.router.get('/user/followers/:userId', authMiddleware.checkAuthentication, GetFollower.prototype.userFollowers);

    return this.router;
  }
}

export const followerRoutes: FollowerRoutes = new FollowerRoutes();
