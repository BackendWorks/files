import { Module } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { FilesController } from './controllers/files.controller';
import { FilesService } from './services/file.service';

@Module({
  controllers: [FilesController],
  imports: [],
  providers: [FilesService, PrismaService],
  exports: [FilesService],
})
export class FilesModule {}
