import { authMiddleware } from '@global/helpers/auth-middleware';
import { AddReactions } from '@reactions/controller/add-reactions';
import { GetReactions } from '@reactions/controller/get-reacions';
import { RemoveReactions } from '@reactions/controller/remove-reaction';
import express, { Router } from 'express';

class ReactionsRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.post('/post/reaction', authMiddleware.checkAuthentication, AddReactions.prototype.reaction);

    this.router.get('/post/reactions/:postId', authMiddleware.checkAuthentication, GetReactions.prototype.reactions);
    this.router.get(
      '/post/reactions/username/:username',
      authMiddleware.checkAuthentication,
      GetReactions.prototype.reactionsByUsername
    );
    this.router.get(
      '/post/single/reaction/username/:username/:postId',
      authMiddleware.checkAuthentication,
      GetReactions.prototype.singleReactionByUsername
    );

    this.router.delete(
      '/post/reaction/:postId/:previousReaction/:postReactions',
      authMiddleware.checkAuthentication,
      RemoveReactions.prototype.reaction
    );

    return this.router;
  }
}

export const reactionsRoutes: ReactionsRoutes = new ReactionsRoutes();
