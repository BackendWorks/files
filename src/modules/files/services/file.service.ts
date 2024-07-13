import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';

import { PrismaService } from '../../../common/services/prisma.service';
import { IAuthUser } from '../interfaces/file.interface';
import { IFileService } from '../interfaces/file.service.interface';
import { GetPresignPutObjectDto } from '../dtos/file.presign.put.dto';
import { GetPresignPutObjectResponseDto } from '../dtos/file.presign.put.response.dto';
import { GetPresignGetObjectResponseDto } from '../dtos/file.presign.get.response.dto';
import { CreateFileDto } from '../dtos/file.create.dto';
import { FileResponseDto } from '../dtos/file.response.dto';
import { UserResponseDto } from '../dtos/user.response.dto';

@Injectable()
export class FilesService implements IFileService {
  public s3Client: S3Client;
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.authClient.connect();
    this.s3Client = new S3Client({
      region: this.configService.get('aws.region'),
      credentials: {
        accessKeyId: this.configService.get('aws.accessKeyId'),
        secretAccessKey: this.configService.get('aws.secretAccessKey'),
      },
    });
  }

  async createFile(
    userId: number,
    data: CreateFileDto,
  ): Promise<FileResponseDto> {
    const { fileName, fileType, storageKey } = data;
    const file = await this.prismaService.files.create({
      data: {
        fileName,
        fileType,
        storageKey,
        userId,
      },
    });
    const userResponse = await firstValueFrom(
      this.authClient.send('getUserById', JSON.stringify({ userId })),
    );
    const user = plainToInstance(UserResponseDto, userResponse);
    return { ...file, author: user };
  }

  async getPresignPutObject(
    { fileName, contentType }: GetPresignPutObjectDto,
    { id: userId }: IAuthUser,
  ): Promise<GetPresignPutObjectResponseDto> {
    try {
      const storageKey = `${userId}/${Date.now()}_${fileName}`;
      const command = new PutObjectCommand({
        Bucket: this.configService.get('aws.bucket'),
        Key: storageKey,
        ContentType: contentType,
      });
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: Number(this.configService.get('presignExpire')),
      });
      return { url, storageKey };
    } catch (e) {
      throw e;
    }
  }

  async getPresignGetObject(
    fileId: string,
  ): Promise<GetPresignGetObjectResponseDto> {
    try {
      const file = await this.prismaService.files.findUnique({
        where: {
          id: fileId,
        },
      });
      if (!file) {
        throw new NotFoundException('file.fileNotFound');
      }
      const command = new GetObjectCommand({
        Bucket: this.configService.get('aws.bucket'),
        Key: file.storageKey,
      });
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: Number(this.configService.get('presignExpire')),
      });
      return {
        url,
      };
    } catch (e) {
      throw e;
    }
  }
}
