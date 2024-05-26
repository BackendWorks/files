import { GetPresignPutObjectDto } from '../dtos/put.presign.dto';
import { GetPresignGetObjectResponseDto } from '../dtos/get.presign.response.dto';
import { GetPresignPutObjectResponseDto } from '../dtos/put.presign.response.dto';
import { IAuthUser } from './file.interface';

export interface IFileService {
  getPresignPutObject(
    params: GetPresignPutObjectDto,
    user: IAuthUser,
  ): Promise<GetPresignPutObjectResponseDto>;
  getPresignGetObject(fileId: string): Promise<GetPresignGetObjectResponseDto>;
}
