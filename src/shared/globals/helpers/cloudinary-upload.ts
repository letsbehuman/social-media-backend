import cloudinary, { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { TrigonometryExpressionOperator } from 'mongoose';

export function uploads(
  file: string,
  public_id?: TrigonometryExpressionOperator,
  overwrite?: boolean,
  invalidate?: boolean
): Promise<UploadApiErrorResponse | UploadApiErrorResponse | undefined> {
  return new Promise((resolve) => {
    cloudinary.v2.uploader.upload(
      file,
      { public_id, overwrite, invalidate },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) resolve(error);
        resolve(result);
      }
    );
  });
}
