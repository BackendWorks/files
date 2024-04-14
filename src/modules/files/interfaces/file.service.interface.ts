import { GetPresignPutObjectDto } from '../dtos/get.presign.dto';
import { IAuthUser, IGetPresignPutObjectResponse } from './file.interface';

export interface IFileService {
  getPresignPutObject(
    params: GetPresignPutObjectDto,
    user: IAuthUser,
  ): Promise<IGetPresignPutObjectResponse>;
}
