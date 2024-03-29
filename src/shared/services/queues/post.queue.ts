import { IPostJobData } from '@post/interfaces/post.interface';
import { BaseQueue } from '@services/queues/base.queue';
import { postWorker } from '@workers/post.worker';

class PostQueue extends BaseQueue {
  constructor() {
    super('post');
    this.processJob('addPostToDBJob', 5, postWorker.savePostToDB);
    this.processJob('deletePostFromDBJob', 5, postWorker.deletePostFromDB);
    this.processJob('updatePostInDBJob', 5, postWorker.updatePostInDB);
  }
  public addPostJob(name: string, data: IPostJobData): void {
    this.addJob(name, data);
  }
}

export const postQueue: PostQueue = new PostQueue();
