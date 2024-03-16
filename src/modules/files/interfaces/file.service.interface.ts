import { GetPresignPutObjectDto } from '../dtos/get.presign.dto';
import {
  GetPresignGetObjectResponse,
  GetPresignPutObjectResponse,
  Users,
} from './file.interface';

export interface IFileService {
  getPresignPutObject(
    params: GetPresignPutObjectDto,
    user: Users,
  ): Promise<GetPresignPutObjectResponse>;
  getPresignGetObject(fileId: string): Promise<GetPresignGetObjectResponse>;
}
