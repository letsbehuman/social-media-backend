import { AddComment } from '@comments/controller/add-comment';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';
import { GetComment } from '@comments/controller/get-comment';

class CommentRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.get('/post/comments/:postId', authMiddleware.checkAuthentication, GetComment.prototype.comments);
    this.router.get(
      '/post/comments/names/:postId',
      authMiddleware.checkAuthentication,
      GetComment.prototype.commentsNamesFromCache
    );
    this.router.get(
      '/post/single/comment/:postId/:commentId',
      authMiddleware.checkAuthentication,
      GetComment.prototype.singleComment
    );

    this.router.post('/post/comment', authMiddleware.checkAuthentication, AddComment.prototype.comment);

    return this.router;
  }
}

export const commentRoutes: CommentRoutes = new CommentRoutes();
