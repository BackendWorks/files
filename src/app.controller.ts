import { Controller, Get, Query } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { GetPresignUrlDto } from './core/interfaces/GetPresignUrlDto';
import { CurrentUser } from './core/user.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('get_presign_object')
  public async getPresignObject(@Payload() data: string) {
    return this.appService.getPresignGetObject(Number(data));
  }

  @Get('/presign')
  getUserProfilePresign(
    @CurrentUser() authUserId: number,
    @Query() params: GetPresignUrlDto,
  ): Promise<{ url: string }> {
    return this.appService.getPresginPutObject(params, authUserId);
  }
}
