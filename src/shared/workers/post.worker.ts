import { postService } from '@services/db/post.services';
import { DoneCallback, Job } from 'bull'; //Redis-based queue for Node
import Logger from 'bunyan';
import { config } from '@root/config';

const log: Logger = config.createLogger('postWorker');

class PostWorker {
  async savePostToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await postService.addPostToDB(key, value); // adding to db
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async deletePostFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo } = job.data;
      await postService.deletePost(keyOne, keyTwo);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const postWorker: PostWorker = new PostWorker();
