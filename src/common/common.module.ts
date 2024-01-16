import configs from '../config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FilesService } from './services/file.service';
import { File, FileSchema } from './schema/file.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [],
  imports: [
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    ConfigModule.forRoot({
      load: configs,
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      expandVariables: true,
    }),
  ],
  providers: [FilesService],
})
export class CommonModule {}
