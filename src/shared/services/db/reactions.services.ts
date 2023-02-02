import { IQueryReaction } from '@reactions/interfaces/reaction.interface';
import { IPostDocument } from '@post/interfaces/post.interface';
import { IReactionDocument } from '@reactions/interfaces/reaction.interface';
import { IUserDocument } from '@user/interfaces/user.interface';
import { PostModel } from '@post/models/post.schema';
import { UserCache } from '@services/redis/user.cache';
import { IReactionJob } from '@reactions/interfaces/reaction.interface';
import { ReactionModel } from '@reactions/models/reaction.schema';
import { omit } from 'lodash';
import mongoose from 'mongoose';
import { Helpers } from '@global/helpers/helpers';

const userCache: UserCache = new UserCache();

class ReactionService {
  public async addReactionDataToDB(reactionData: IReactionJob): Promise<void> {
    const { postId, userTo, userFrom, username, type, previousReaction, reactionObject } = reactionData;
    let updatedReactionObject: IReactionDocument = reactionObject as IReactionDocument;
    if (previousReaction) {
      updatedReactionObject = omit(reactionObject, ['_id']); // To avoid a conflic with duplicate _id
    }
    const updatedReaction: [IUserDocument, IReactionDocument, IPostDocument] = (await Promise.all([
      userCache.getUserFromCache(`${userTo}`),
      ReactionModel.replaceOne({ postId, type: previousReaction, username }, updatedReactionObject, { upsert: true }), //with upsert operator, if the query is found is going to replace it with the send argument, otherwise is going to create a new document
      PostModel.findOneAndUpdate(
        { _id: postId },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1,
            [`reactions.${type}`]: 1
          }
        },
        { new: true }
      )
    ])) as unknown as [IUserDocument, IReactionDocument, IPostDocument];
    //send reactions notification
  }
  public async removeReactionDataFromDB(reactionData: IReactionJob): Promise<void> {
    const { postId, previousReaction, username } = reactionData;
    await Promise.all([
      ReactionModel.deleteOne({ postId, type: previousReaction, username }),
      PostModel.findOne(
        { _id: postId },
        {
          $inc: {
            [`reactions.${previousReaction}`]: -1
          }
        },
        { new: true }
      )
    ]);
  }
  public async getPostReaction(
    query: IQueryReaction,
    sort: Record<string, 1 | -1>
  ): Promise<[IReactionDocument[], number]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([{ $match: query }, { $sort: sort }]);
    return [reactions, reactions.length];
  }

  public async getSinglePostReactionByUsername(
    postId: string,
    username: string
  ): Promise<[IReactionDocument, number] | []> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      { $match: { postId: new mongoose.Types.ObjectId(postId), username: Helpers.firstLetterUppercase(username) } } //because the aggregate method needs a Object as a postId instead of a string, we create a new ObjectId from mongoose
    ]);
    //aggegate always returns a list
    return reactions.length ? [reactions[0], 1] : [];
  }

  public async getReactionsByUsername(username: string): Promise<IReactionDocument[]> {
    const reactions: IReactionDocument[] = await ReactionModel.aggregate([
      { $match: { username: Helpers.firstLetterUppercase(username) } }
    ]);
    return reactions;
  }
}

export const reactionService: ReactionService = new ReactionService();
