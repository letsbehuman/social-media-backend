import { ServerError } from './../../globals/helpers/error-handler';
import { IUserDocument } from '@user/interfaces/user.interface';
import { BaseCache } from '@services/redis/base.cache';
import Logger from 'bunyan';
import { config } from '@root/config';

const log: Logger = config.createLogger('userCache');

export class UserCache extends BaseCache {
  constructor() {
    super('userCache');
  }
  //we can not get access of all the properties of a set from Redis, the next lines are the solution for that
  public async saveUserToCache(key: string, userUId: string, createdUser: IUserDocument): Promise<void> {
    const createdAt = new Date();
    const {
      _id,
      uId,
      username,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social
    } = createdUser;
    const firstList: string[] = [
      '_id',
      `${_id}`,
      'uId',
      `${uId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'avatarColor',
      `${avatarColor}`,
      'createdAt',
      `${createdAt}`,
      'postsCount',
      `${postsCount}`
    ];
    const secondList: string[] = [
      'blocked',
      JSON.stringify(blocked),
      'blockedBy',
      JSON.stringify(blockedBy),
      'profilePicture',
      `${profilePicture}`,
      'followersCount',
      `${followersCount}`,
      'followingCount',
      `${followingCount}`,
      'notifications',
      JSON.stringify(notifications),
      'social',
      JSON.stringify(social)
    ];
    const thirdList: string[] = [
      'work',
      `${work}`,
      'location',
      `${location}`,
      'school',
      `${school}`,
      'quote',
      `${quote}`,
      'bgImageId',
      `${bgImageId}`,
      'bgImageVersion',
      `${bgImageVersion}`
    ];
    const dataToSave: string[] = [...firstList, ...secondList, ...thirdList];

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      //Sorting set
      await this.client.ZADD('user', { score: parseInt(userUId, 10), value: `${key}` });
      for (let i = 0; i < dataToSave.length; i += 2) {
        await this.client.HSET(`users:${key}`, dataToSave[i], dataToSave[i + 1]);
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error, try again.');
    }
  }
}
