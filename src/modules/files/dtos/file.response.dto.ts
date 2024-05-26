import { $Enums, Files } from '@prisma/client';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { UserResponseDto } from './user.response.dto';

export class FileResponseDto implements Files {
  createdAt: Date;
  deletedAt: Date;
  fileName: string;
  fileType: $Enums.FileType;
  id: string;
  isDeleted: boolean;
  storageKey: string;
  storagePath: string;
  updatedAt: Date;
  userId: number;

  @Type(() => UserResponseDto)
  @ValidateNested()
  author: UserResponseDto;
}
