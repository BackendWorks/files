import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoreModule } from 'src/core/core.module';
import { CommonModule } from 'src/common/common.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { join } from 'path';
import { FilesModule } from 'src/modules/files/files.module';

@Module({
  imports: [
    CoreModule,
    CommonModule,
    TerminusModule,
    FilesModule,
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
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, '../i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
