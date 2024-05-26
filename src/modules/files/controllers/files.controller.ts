import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { FilesService } from '../services/file.service';
import { GetPresignPutObjectDto } from '../dtos/put.presign.dto';
import { IAuthUser } from '../interfaces/file.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'src/decorators/auth.decorator';
import { Serialize } from 'src/decorators/serialize.decorator';
import { FileResponseDto } from '../dtos/file.response.dto';
import { CreateFileDto } from '../dtos/create.file.dto';
import { AllowedRoles } from 'src/decorators/roles.decorator';

@ApiTags('files')
@Controller({
  path: '/files',
  version: '1',
})
export class FilesController {
  constructor(private readonly fileService: FilesService) {}

  @ApiBearerAuth('accessToken')
  @AllowedRoles(['User', 'Admin'])
  @Serialize(FileResponseDto)
  @Post()
  createFile(
    @AuthUser() user: IAuthUser,
    @Body() data: CreateFileDto,
  ): Promise<FileResponseDto> {
    return this.fileService.createFile(user.id, data);
  }

  @ApiBearerAuth('accessToken')
  @Get('/put-presign')
  putPresignUrl(
    @AuthUser() user: IAuthUser,
    @Query() params: GetPresignPutObjectDto,
  ) {
    return this.fileService.getPresignPutObject(params, user);
  }

  @ApiBearerAuth('accessToken')
  @Get('/get-presign/:id')
  getPresignUrl(@Param('id') fileId: string) {
    return this.fileService.getPresignGetObject(fileId);
  }
}
