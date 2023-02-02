import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ReactionCache } from '@services/redis/reactions.cache';
import { reactionQueue } from '@services/queues/reactions.queue';
import { IReactionJob } from '@reactions/interfaces/reaction.interface';

const reactionCache: ReactionCache = new ReactionCache();

export class RemoveReactions {
  public async reaction(req: Request, res: Response): Promise<void> {
    const { postId, previousReaction, postReactions } = req.params;

    await reactionCache.removePostReactionFromCache(postId, `${req.currentUser?.username}`, JSON.parse(postReactions));

    const databaseReactionData: IReactionJob = {
      postId,
      username: req.currentUser!.username,
      previousReaction
    };
    reactionQueue.addReactionJob('removeReactionFromDB', databaseReactionData);
    res.status(HTTP_STATUS.OK).json({ message: 'Reaction removed from post successfully' });
  }
}
