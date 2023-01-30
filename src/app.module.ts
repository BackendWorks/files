import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { JwtAuthGuard } from './core/guards/auth.guard';
import { PrismaService } from './core/services';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [
    ConfigModule,
    TerminusModule,
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [`${configService.get('rb_url')}`],
            queue: `${configService.get('auth_queue')}`,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
