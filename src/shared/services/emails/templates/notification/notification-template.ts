import fs from 'fs'; //core module dont need installation
import ejs from 'ejs';
import { INotificationTemplate } from '@notifications/interfaces/notifications.interface';

class NotificationTemplate {
  public notificationMessageTemplate(templateParams: INotificationTemplate): string {
    const { username, header, message } = templateParams;
    return ejs.render(fs.readFileSync(__dirname + '/notification.ejs', 'utf8'), {
      username,
      header,
      message,
      image_url:
        'https://w7.pngwing.com/pngs/30/252/png-transparent-computer-icons-password-strength-padlock-text-technic-symbol-thumbnail.png'
    });
  }
}

export const notificationTemplate: NotificationTemplate = new NotificationTemplate();
