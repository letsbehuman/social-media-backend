import { IBlockedUserJobData } from '@followers/interfaces/follower.interface';
import { BaseQueue } from '@services/queues/base.queue';
import { blockedUserWorker } from '@workers/blocked.worker';

class BlockedQueue extends BaseQueue {
  constructor() {
    super('blockedUsers');
    this.processJob('updateBlockedUserToDB', 5, blockedUserWorker.updateBlockedUserToDB);
    this.processJob('removeBlockedUserFromDB', 5, blockedUserWorker.updateBlockedUserToDB);
  }
  public updateBlockedUserJob(name: string, data: IBlockedUserJobData): void {
    this.addJob(name, data);
  }
}

export const blockedQueue: BlockedQueue = new BlockedQueue();
