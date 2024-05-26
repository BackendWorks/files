import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetPresignPutObjectDto {
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
}
