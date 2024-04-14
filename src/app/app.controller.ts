import { TransformPayload } from '../core/decorators/message.decorator';
import { Controller, Get } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { Public } from 'src/core/decorators/public.decorator';
import { FilesService } from 'src/modules/files/services/file.service';
import { CreateFileCallDto, UpdateFileCallDto } from './app.interfaces';

@Controller()
export class AppController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly fileService: FilesService,
    private readonly mongooseHealth: MongooseHealthIndicator,
  ) {}

  @MessagePattern('createFileCall')
  async createFile(@TransformPayload() payload: CreateFileCallDto) {
    return this.fileService.createFile(payload);
  }

  @MessagePattern('deleteFileCall')
  async deleteFile(@TransformPayload() fileId: string) {
    return this.fileService.deleteFile(fileId);
  }

  @MessagePattern('updateFileCall')
  async updateFile(@TransformPayload() payload: UpdateFileCallDto) {
    return this.fileService.updateFile(payload.fileId, payload.storageKey);
  }

  @Get('/health')
  @HealthCheck()
  @Public()
  public async getHealth() {
    return this.healthCheckService.check([
      () => this.mongooseHealth.pingCheck('mongoDB'),
    ]);
  }
}
