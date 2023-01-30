import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from './config/config.service';
import { GetPresignUrlDto } from './core/dtos';
import { PrismaService } from './core/services';

@Injectable()
export class AppService {
  public s3: S3;
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    this.s3 = new S3({
      ...this.configService.get('aws'),
    });
  }

  async getPresginPutObject(
    params: GetPresignUrlDto,
    authUserId: number,
  ): Promise<{ url: string; id: string }> {
    try {
      const url = await this.s3.getSignedUrlPromise('putObject', {
        Bucket: this.configService.get('bucket'),
        Key: `${authUserId}/${params.type}/${Date.now()}_${params.fileName}`,
        Expires: Number(this.configService.get('presignExpire')),
      });
      const file = await this.prismaService.files.create({
        data: {
          name: params.fileName,
          key: `${authUserId}/${params.type}/${Date.now()}_${params.fileName}`,
          user_id: authUserId,
        },
      });
      return { url, id: file.id };
    } catch (e) {
      console.log(e);
    }
  }

  async getPresignGetObject(fileId: string): Promise<{ url: string }> {
    try {
      const file = await this.prismaService.files.findUnique({
        where: { id: fileId },
      });
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
