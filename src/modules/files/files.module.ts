import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { FilesService } from './services/file.service';
import { FilesController } from './controllers/files.controller';

@Module({
  controllers: [FilesController],
  imports: [
    CommonModule,
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [`${configService.get('rmq.uri')}`],
            queue: `${configService.get('rmq.auth')}`,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
