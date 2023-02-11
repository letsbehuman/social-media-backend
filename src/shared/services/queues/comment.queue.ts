import { ICommentJob } from '@comments/interfaces/comment.interface';
import { BaseQueue } from '@services/queues/base.queue';
import { commentWorker } from '@workers/comments.worker';

class CommentQueue extends BaseQueue {
  constructor() {
    super('comment');
    this.processJob('addCommentsToDB', 5, commentWorker.addCommentsToDB);
  }
  public addCommentJob(name: string, data: ICommentJob): void {
    this.addJob(name, data);
  }
}

export const commentQueue: CommentQueue = new CommentQueue();
