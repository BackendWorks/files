import { Injectable, NotFoundException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/common/services/prisma.service';
import {
  GetPresignGetObjectResponse,
  GetPresignPutObjectResponse,
  Users,
} from '../interfaces/file.interface';
import { IFileService } from '../interfaces/file.service.interface';
import { GetPresignPutObjectDto } from '../dtos/get.presign.dto';

@Injectable()
export class FilesService implements IFileService {
  public s3Client: S3Client;
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get('aws.region'),
      credentials: {
        accessKeyId: this.configService.get('aws.accessKeyId'),
        secretAccessKey: this.configService.get('aws.secretAccessKey'),
      },
    });
  }

  async getPresignPutObject(
    params: GetPresignPutObjectDto,
    user: Users,
  ): Promise<GetPresignPutObjectResponse> {
    try {
      const key = `${user.id}_${user.username}/${Date.now()}_${params.name}`;
      const command = new PutObjectCommand({
        Bucket: this.configService.get('bucket'),
        Key: key,
        ContentType: params.type,
      });
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: Number(this.configService.get('presignExpire')),
      });
      const file = await this.prismaService.files.create({
        data: {
          fileName: params.name,
          type: params.type,
          storageKey: key,
          userId: user.id,
        },
      });
      return { url, fileId: file.id };
    } catch (e) {
      throw e;
    }
  }

  async getPresignGetObject(
    fileId: string,
  ): Promise<GetPresignGetObjectResponse> {
    try {
      const file = await this.prismaService.files.findUnique({
        where: {
          id: fileId,
        },
      });
      if (!file) {
        throw new NotFoundException('fileNotFound');
      }
      const command = new GetObjectCommand({
        Bucket: this.configService.get('bucket'),
        Key: file.storageKey,
      });
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: Number(this.configService.get('presignExpire')),
      });
      return {
        url,
        name: file.fileName,
        createdAt: file.createdAt,
        id: file.id,
      };
    } catch (e) {
      throw e;
    }
  }
}
