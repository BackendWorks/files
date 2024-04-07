import { GetPresignPutObjectDto } from '../dtos/get.presign.dto';
import {
  GetPresignGetObjectResponse,
  GetPresignPutObjectResponse,
  IAuthUser,
} from './file.interface';

export interface IFileService {
  getPresignPutObject(
    params: GetPresignPutObjectDto,
    user: IAuthUser,
  ): Promise<GetPresignPutObjectResponse>;
  getPresignGetObject(fileId: string): Promise<GetPresignGetObjectResponse>;
}
