import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Files, FilesDocument } from './schemas/files.schema';
import { S3 } from 'aws-sdk';
import { ConfigService } from './config/config.service';
import { GetPresignUrlDto } from './core/interfaces/GetPresignUrlDto';

@Injectable()
export class AppService {
  fileService: S3;
  logger: Logger;
  constructor(
    @InjectModel(Files.name) private filesModel: Model<FilesDocument>,
    private configService: ConfigService,
  ) {
    this.fileService = new S3({
      ...this.configService.get('aws'),
    });
  }

  async getPresginPutObject(
    params: GetPresignUrlDto,
    authUserId: number,
  ): Promise<{ url: string; id: number }> {
    try {
      const url = await this.fileService.getSignedUrlPromise('putObject', {
        Bucket: this.configService.get('bucket'),
        Key: `${authUserId}/${params.type}/${Date.now()}_${params.fileName}`,
        Expires: Number(this.configService.get('presignExpire')),
      });
      const file = await this.filesModel.create({
        name: params.fileName,
        key: `${authUserId}/${params.type}/${Date.now()}_${params.fileName}`,
        createdAt: new Date(),
        user: authUserId,
      });
      return { url, id: file._id };
    } catch (e) {
      this.logger.error(e);
    }
  }

  async getPresignGetObject(fileId: number): Promise<{ url: string }> {
    try {
      const file = await this.filesModel.findById(fileId);
      const params = {
        Bucket: this.configService.get('bucket'),
        Key: file.key,
      };
      const url = await this.fileService.getSignedUrlPromise(
        'getObject',
        params,
      );
      return { url };
    } catch (e) {
      this.logger.error(e);
    }
  }
}
