import { IQueryComment } from './../../../features/comments/interfaces/comment.interface';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ICommentDocument, ICommentJob } from '@comments/interfaces/comment.interface';
import { CommentsModel } from '@comments/models/comment.schema';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Query } from 'mongoose';

const userCache: UserCache = new UserCache();

class CommentService {
  public async addCommentToDB(commentData: ICommentJob): Promise<void> {
    const { postId, userTo, userFrom, comment, username } = commentData;
    const comments: Promise<ICommentDocument> = CommentsModel.create(comment);
    const post: Query<IPostDocument, IPostDocument> = PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { commentsCount: 1 } },
      { new: true }
    ) as Query<IPostDocument, IPostDocument>;
    const user: Promise<IUserDocument> = userCache.getUserFromCache(userTo) as Promise<IUserDocument>;
    const response: [ICommentDocument, IPostDocument, IUserDocument] = Promise.all([comments, post, user]);

    // send comments notifications
  }
  public async getPostComments(Query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentDocument[]> {
    const comments: ICommentDocument[] = await CommentsModel.aggregate([{ $match: query }, { $sort: sort }]);
    return comments;
  }
}

export const commentService: CommentService = new CommentService();
