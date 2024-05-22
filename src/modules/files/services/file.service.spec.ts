import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/services/prisma.service';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NotFoundException } from '@nestjs/common';
import { IAuthUser } from '../interfaces/file.interface';
import { GetPresignPutObjectDto } from '../dtos/get.presign.dto';
import { FilesService } from './file.service';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('FilesService', () => {
  let service: FilesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config = {
                'aws.region': 'us-east-1',
                'aws.accessKeyId': 'testAccessKeyId',
                'aws.secretAccessKey': 'testSecretAccessKey',
                bucket: 'test-bucket',
                presignExpire: '3600',
              };
              return config[key];
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            files: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    prismaService = module.get<PrismaService>(PrismaService);

    (getSignedUrl as jest.Mock).mockResolvedValue('https://signed-url.com');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPresignPutObject', () => {
    it('should return presigned URL and file ID', async () => {
      const params: GetPresignPutObjectDto = {
        name: 'test-file.txt',
        type: 'text/plain',
      };
      const user = {
        id: 1,
        username: 'testuser',
      } as IAuthUser;

      const createdFile = { id: 'file-id' };
      prismaService.files.create = jest.fn().mockResolvedValue(createdFile);

      const result = await service.getPresignPutObject(params, user);

      expect(prismaService.files.create).toHaveBeenCalledWith({
        data: {
          fileName: params.name,
          type: params.type,
          storageKey: expect.any(String),
          userId: user.id,
        },
      });
      expect(result).toEqual({
        url: 'https://signed-url.com',
        fileId: createdFile.id,
      });
      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.any(S3Client),
        expect.any(PutObjectCommand),
        { expiresIn: 3600 },
      );
    });
  });

  describe('getPresignGetObject', () => {
    it('should return presigned URL and file details', async () => {
      const fileId = 'file-id';
      const file = {
        id: fileId,
        fileName: 'test-file.txt',
        storageKey: 'storage-key',
        createdAt: new Date(),
      };
      prismaService.files.findUnique = jest.fn().mockResolvedValue(file);

      const result = await service.getPresignGetObject(fileId);

      expect(prismaService.files.findUnique).toHaveBeenCalledWith({
        where: { id: fileId },
      });
      expect(result).toEqual({
        url: 'https://signed-url.com',
        name: file.fileName,
        createdAt: file.createdAt,
        id: file.id,
      });
      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.any(S3Client),
        expect.any(GetObjectCommand),
        { expiresIn: 3600 },
      );
    });

    it('should throw NotFoundException if file not found', async () => {
      const fileId = 'nonexistent-file-id';
      prismaService.files.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.getPresignGetObject(fileId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaService.files.findUnique).toHaveBeenCalledWith({
        where: { id: fileId },
      });
    });
  });
});
