import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'src/decorators/auth.decorator';
import { AllowedRoles } from 'src/decorators/roles.decorator';

import { FilesService } from '../services/file.service';
import { GetPresignPutObjectDto } from '../dtos/file.presign.put.dto';
import { IAuthUser } from '../interfaces/file.interface';
import { FileResponseDto } from '../dtos/file.response.dto';
import { CreateFileDto } from '../dtos/file.create.dto';

@ApiTags('files')
@Controller({
  path: '/files',
  version: '1',
})
export class FilesController {
  constructor(private readonly fileService: FilesService) {}

  @ApiBearerAuth('accessToken')
  @AllowedRoles(['User', 'Admin'])
  @Post()
  createFile(
    @AuthUser() user: IAuthUser,
    @Body() data: CreateFileDto,
  ): Promise<FileResponseDto> {
    return this.fileService.createFile(user.id, data);
  }

  @ApiBearerAuth('accessToken')
  @Get('/presign/put')
  putPresignUrl(
    @AuthUser() user: IAuthUser,
    @Query() params: GetPresignPutObjectDto,
  ) {
    return this.fileService.getPresignPutObject(params, user);
  }

  @ApiBearerAuth('accessToken')
  @Get('/presign/get/:id')
  getPresignUrl(@Param('id') fileId: string) {
    return this.fileService.getPresignGetObject(fileId);
  }
}
