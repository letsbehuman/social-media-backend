import { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import HTTP_STATUS from 'http-status-codes';
import { authService } from '@services/db/auth.services';
import { BadRequestError } from '@global/helpers/error-handler';
import { config } from '@root/config';
import { signinSchema } from '@auth/schemas/signin';

export class SignIn {
  @joiValidation(signinSchema)
  public async read(req: Request, res: Response): Promise<void> {}
}
