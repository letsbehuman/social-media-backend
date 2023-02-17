import { AddFollow } from '@followers/controller/follower-user';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';

class FollowerRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.put('/user/follow/:followerId', authMiddleware.checkAuthentication, AddFollow.prototype.follower);

    return this.router;
  }
}

export const followerRoutes: FollowerRoutes = new FollowerRoutes();
