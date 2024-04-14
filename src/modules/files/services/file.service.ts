import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import {
  IAuthUser,
  IGetPresignPutObjectResponse,
} from '../interfaces/file.interface';
import { IFileService } from '../interfaces/file.service.interface';
import { GetPresignPutObjectDto } from '../dtos/get.presign.dto';
import { PrismaService } from 'src/core/services/prisma.service';
import { Files } from '@prisma/client';
import { CreateFilesDto } from '../dtos/create.files.dto';

@Injectable()
export class FilesService implements IFileService {
  private readonly s3Client: S3Client;

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

  async createFile(data: CreateFilesDto): Promise<Files> {
    const { storageKey, type, userId } = data;
    return this.prismaService.files.create({
      data: {
        fileName: data.fileName.trim(),
        storageKey,
        type,
        userId,
      },
    });
  }

  async deleteFile(fileId: string): Promise<Files> {
    return this.prismaService.files.update({
      where: {
        id: fileId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async updateFile(fileId: string, storageKey: string): Promise<Files> {
    return this.prismaService.files.update({
      where: {
        id: fileId,
      },
      data: {
        storageKey,
      },
    });
  }

  async getPresignPutObject(
    params: GetPresignPutObjectDto,
    user: IAuthUser,
  ): Promise<IGetPresignPutObjectResponse> {
    try {
      const storageKey = `${user.id}_${user.username}/${Date.now()}_${
        params.name
      }`;
      const command = new PutObjectCommand({
        Bucket: this.configService.get('bucket'),
        Key: storageKey,
        ContentType: params.type,
      });
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: Number(this.configService.get('presignExpire')),
      });
      return { url, storageKey, fileName: params.name };
    } catch (e) {
      throw e;
    }
  }
}
