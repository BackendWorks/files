import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { CurrentUser } from './core/decorators';
import { JwtAuthGuard, RolesGuard } from './core/guards';

@Controller()
@UseGuards(JwtAuthGuard)
@UseGuards(RolesGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/presign')
  getUserProfilePresign(
    @CurrentUser() authUserId: number,
    @Query() params: { name: string; type: string },
  ): Promise<{ url: string; id: string }> {
    return this.appService.getPresginPutObject(params, authUserId);
  }

  @Get(':id')
  getFilePresign(@Param() params): Promise<{ url: string }> {
    return this.appService.getPresignGetObject(params.id);
  }
}
