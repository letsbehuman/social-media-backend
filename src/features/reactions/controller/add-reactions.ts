import { ObjectId } from 'mongodb';
import { IReactionDocument } from './../interfaces/reaction.interface';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { addReactionSchema } from '@reactions/schemas/reactions.schemes';
import { ReactionCache } from '@services/redis/reactions.cache';

const reactionCache: ReactionCache = new ReactionCache();

export class AddReactions {
  @joiValidation(addReactionSchema)
  public async reaction(req: Request, res: Response): Promise<void> {
    const { userTo, postId, type, previousReaction, postReactions, profilePicture } = req.body;
    const reactionObject: IReactionDocument = {
      _id: new ObjectId(),
      postId,
      type,
      avataColor: req.currentUser!.avatarColor,
      username: req.currentUser!.username,
      profilePicture
    } as IReactionDocument;
    await reactionCache.savePostReactionToCache(postId, reactionObject, postReactions, type, previousReaction);
    res.status(HTTP_STATUS.OK).json({ message: 'Reaction added successfully' });
  }
}
