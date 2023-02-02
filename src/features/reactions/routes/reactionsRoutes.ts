import { authMiddleware } from '@global/helpers/auth-middleware';
import { AddReactions } from '@reactions/controller/add-reactions';
import { RemoveReactions } from '@reactions/controller/remove-reaction';
import express, { Router } from 'express';

class ReactionsRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.post('/post/reaction', authMiddleware.checkAuthentication, AddReactions.prototype.reaction);
    this.router.delete(
      '/post/reaction/:postId/:previousReaction/:postReactions',
      authMiddleware.checkAuthentication,
      RemoveReactions.prototype.reaction
    );

    return this.router;
  }
}

export const reactionsRoutes: ReactionsRoutes = new ReactionsRoutes();
