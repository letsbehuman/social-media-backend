import { IResetPasswordParams } from '@user/interfaces/user.interface';
import { forgotPasswordTemplate } from '@services/emails/templates/forgot-password/forgot-password-template';
import moment from 'moment';
import publicIp from 'ip';
import { Request, Response } from 'express';
import { config } from '@root/config';
import HTTP_STATUS from 'http-status-codes';
import { authService } from '@services/db/auth.services';
import { BadRequestError } from '@global/helpers/error-handler';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { emailSchema, passwordSchema } from '@auth/schemas/password';
import crypto from 'crypto'; // does not need installation
import { emailQueue } from '@services/queues/email.queue';
import { resetPasswordTemplate } from '@services/emails/templates/reset-password/reset-password.tamplate';

export class Password {
  @joiValidation(emailSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email);
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    await authService.updatePasswordToken(`${existingUser._id}`, randomCharacters, Date.now() * 60 * 60 * 1000);

    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`;
    const template: string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username!, resetLink);
    emailQueue.addEmailJob('forgotPasswordEmail', { template, receiverEmail: email, subject: 'Reset your password' });
    res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent.' });
  }
  @joiValidation(passwordSchema)
  public async update(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword } = req.body;
    const { token } = req.params; // Add a Validation in joiValidation
    const existingUser: IAuthDocument = await authService.getAuthUserByPasswordToken(token);
    if (password !== confirmPassword) {
      throw new BadRequestError('Password do not match');
    }
    if (!existingUser) {
      throw new BadRequestError('Reset token has expired');
    }
    existingUser.password = password;
    existingUser.passwordResetExpires = undefined;
    existingUser.passwordResetToken = undefined;
    await existingUser.save(); //save() comes from features/auth/models/auth.schema

    const templateParams: IResetPasswordParams = {
      username: existingUser.username!,
      email: existingUser.email!,
      ipaddress: publicIp.address(),
      date: moment().format('DD/MM/YYYY HH:mm')
    };

    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('forgotPasswordEmail', {
      template,
      receiverEmail: existingUser.email!,
      subject: 'Password reset confirmation'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated.' });
  }
}
