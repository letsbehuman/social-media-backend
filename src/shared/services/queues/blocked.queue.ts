import { IBlockedUserJobData } from '@followers/interfaces/follower.interface';
import { BaseQueue } from '@services/queues/base.queue';
import { blockedWorker } from '@workers/blocked.worker';

class BlockedQueue extends BaseQueue {
  constructor() {
    super('blockedUsers');
    this.processJob('updateBlockedUserToDB', 5, blockedWorker.updateBlockedUserToDB);
    this.processJob('removeBlockedUserFromDB', 5, blockedWorker.updateBlockedUserToDB);
  }
  public updateBlockedUserJob(name: string, data: IBlockedUserJobData): void {
    this.addJob(name, data);
  }
}

export const blockedQueue: BlockedQueue = new BlockedQueue();
