import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from './config/config.service';
import { File, FileDocument } from './app.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AppService {
  public s3: S3;
  constructor(
    private configService: ConfigService,
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
  ) {
    this.s3 = new S3({
      ...this.configService.get('aws'),
    });
  }

  async getPresginPutObject(
    params: { name: string; type: string },
    authUserId: number,
  ): Promise<{ url: string; id: string }> {
    try {
      const url = await this.s3.getSignedUrlPromise('putObject', {
        Bucket: this.configService.get('bucket'),
        Key: `${authUserId}/${params.type}/${Date.now()}_${params.name}`,
        Expires: Number(this.configService.get('presignExpire')),
      });
      const file = new this.fileModel({
        name: params.name,
        key: `${authUserId}/${params.type}/${Date.now()}_${params.name}`,
        user_id: authUserId,
      });
      await file.save();
      return { url, id: file.id };
    } catch (e) {
      console.log(e);
    }
  }

  async getPresignGetObject(fileId: string): Promise<{ url: string }> {
    try {
      const file = await this.fileModel.findById(fileId);
      const params = {
        Bucket: this.configService.get('bucket'),
        Key: file.key,
      };
      const url = await this.s3.getSignedUrlPromise('getObject', params);
      return { url };
    } catch (e) {
      console.log(e);
    }
  }
}
