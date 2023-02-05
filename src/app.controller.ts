import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { CurrentUser } from './decorators';
import { JwtAuthGuard, RolesGuard } from './guards';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetPresignDto } from './dtos';

@Controller()
@UseGuards(JwtAuthGuard)
@UseGuards(RolesGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/presign')
  getPresignUrl(
    @CurrentUser() userId: number,
    @Query() params: GetPresignDto,
  ): Promise<{ url: string }> {
    return this.appService.getPresginPutObject(params, userId);
  }

  @MessagePattern('get_file_by_fileid')
  getFile(@Payload() data: string) {
    const payload = JSON.parse(data);
    console.log({ payload });
    return this.appService.getPresignGetObject(payload.fileId);
  }
}
