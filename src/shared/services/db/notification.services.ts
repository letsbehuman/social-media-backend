import { INotificationDocument } from '@notifications/interfaces/notifications.interface';
import { NotificationModel } from '@notifications/models/notification.schema';
import mongoose from 'mongoose';

class NotificationService {
  public async getNotifications(userId: string): Promise<INotificationDocument[]> {
    const notifications: INotificationDocument[] = await NotificationModel.aggregate([
      { $match: { userTo: new mongoose.Types.ObjectId(userId) } },
      { $lookup: { from: 'User', localField: 'userFrom', foreignField: '_id', as: 'userFrom' } },
      { $unwind: '$userFrom' }, // it return and obj instead of and array
      { $lookup: { from: 'Auth', localField: 'userFrom.authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      {
        $project: {
          _id: 1,
          message: 1,
          comment: 1,
          createdAt: 1,
          createdItemId: 1,
          entityId: 1,
          notificationType: 1,
          gifUrl: 1,
          imgId: 1,
          imgVersion: 1,
          post: 1,
          reaction: 1,
          read: 1,
          userTo: 1,
          userFrom: {
            profilePicture: '$userFrom.profilePicture',
            username: '$authId.username',
            avatarColor: '$authId.avatarColor',
            uId: '$authId.uId'
          }
        }
      }
    ]);
    return notifications;
  }
}

export const notificationService: NotificationService = new NotificationService();
