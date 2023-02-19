import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { CurrentUser, Public } from './decorators';
import { JwtAuthGuard, RolesGuard } from './guards';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetPresignDto } from './dtos';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

@Controller()
@UseGuards(JwtAuthGuard)
@UseGuards(RolesGuard)
export class AppController {
  constructor(
    private readonly appService: AppService,
    private healthCheckService: HealthCheckService,
    private mongooseHealth: MongooseHealthIndicator,
  ) {}

  @Get('/health')
  @HealthCheck()
  @Public()
  public async getHealth() {
    return this.healthCheckService.check([
      () => this.mongooseHealth.pingCheck('mongoDB'),
    ]);
  }

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
