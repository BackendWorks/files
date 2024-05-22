import { Module } from '@nestjs/common';
import { FilesController } from './controllers/files.controller';
import { FilesService } from './services/file.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [FilesController],
  imports: [CommonModule],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
