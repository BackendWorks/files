import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateFileDto {
  @ApiProperty({
    example: 'test.png',
  })
  @IsString()
  @IsNotEmpty({ message: 'fileName is required' })
  fileName: string;

  @ApiProperty({
    example: 'image/png',
  })
  @IsString()
  @IsNotEmpty({ message: 'contentType is required' })
  contentType: string;

  @ApiProperty({
    example: 'PNG',
  })
  @IsEnum(FileType)
  @IsNotEmpty({ message: 'fileType is required' })
  fileType: FileType;

  @ApiProperty({
    example: `${Date.now()}_filename.png`,
  })
  @IsString()
  @IsNotEmpty({ message: 'storageKey is required' })
  storageKey: string;

  @ApiProperty({
    example: `userId/${Date.now()}_filename.png`,
  })
  @IsString()
  @IsNotEmpty({ message: 'storagePath is required' })
  storagePath: string;
}
