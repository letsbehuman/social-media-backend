import { followerService } from '@services/db/follower.services';
import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';

const log: Logger = config.createLogger('followerWorker');

class FollowerWorker {
  async addFollowerToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { followerId, followeeId, username, followerDocumentId } = job.data;
      await followerService.addFollowerToDB(followerId, followeeId, username, followerDocumentId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
  async removeFollowerFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { followerId, followeeId } = job.data;
      await followerService.removeFollowerFormDB(followeeId, followerId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const followerWorker: FollowerWorker = new FollowerWorker();
