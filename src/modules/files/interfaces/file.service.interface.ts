import { GetPresignPutObjectDto } from '../dtos/file.presign.put.dto';
import { GetPresignGetObjectResponseDto } from '../dtos/file.presign.get.response.dto';
import { GetPresignPutObjectResponseDto } from '../dtos/file.presign.put.response.dto';
import { IAuthUser } from './file.interface';

export interface IFileService {
  getPresignPutObject(
    params: GetPresignPutObjectDto,
    user: IAuthUser,
  ): Promise<GetPresignPutObjectResponseDto>;
  getPresignGetObject(fileId: string): Promise<GetPresignGetObjectResponseDto>;
}
