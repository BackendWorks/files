import { Controller, Post, Query } from '@nestjs/common';
import { AuthUser } from 'src/core/decorators/auth.user.decorator';
import { FilesService } from '../services/file.service';
import { GetPresignPutObjectDto } from '../dtos/get.presign.dto';
import { IAuthUser } from '../interfaces/file.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('files')
@Controller({
  path: '/files',
  version: '1',
})
export class FilesController {
  constructor(private readonly fileService: FilesService) {}

  @Post('/presign-url')
  async getPresignUrl(
    @AuthUser() user: IAuthUser,
    @Query() params: GetPresignPutObjectDto,
  ) {
    return this.fileService.getPresignPutObject(params, user);
  }
}
