import { Controller, Get, Param, Query } from '@nestjs/common';
import { AuthUser } from 'src/decorators/auth.user.decorator';
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

  @Get('/put-presign')
  putPresignUrl(
    @AuthUser() user: IAuthUser,
    @Query() params: GetPresignPutObjectDto,
  ) {
    return this.fileService.getPresignPutObject(params, user);
  }

  @Get('/get-presign/:id')
  getPresignUrl(@Param('id') fileId: string) {
    return this.fileService.getPresignGetObject(fileId);
  }
}
