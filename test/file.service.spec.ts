import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NotFoundException } from '@nestjs/common';
import { AllowedFileType, Files } from '@prisma/client';
import { of } from 'rxjs';
import { plainToInstance } from 'class-transformer';

import { FilesService } from '../src/modules/files/services/file.service';
import { PrismaService } from '../src/common/services/prisma.service';
import { CreateFileDto } from '../src/modules/files/dtos/file.create.dto';
import { UserResponseDto } from '../src/modules/files/dtos/user.response.dto';

jest.mock('@aws-sdk/s3-request-presigner');

describe('FilesService', () => {
  let service: FilesService;
  let prismaService: PrismaService;
  let authClient: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: PrismaService,
          useValue: {
            files: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              switch (key) {
                case 'aws.region':
                  return 'us-east-1';
                case 'aws.accessKeyId':
                  return 'test-access-key';
                case 'aws.secretAccessKey':
                  return 'test-secret-key';
                case 'bucket':
                  return 'test-bucket';
                case 'presignExpire':
                  return '3600';
                default:
                  return null;
              }
            }),
          },
        },
        {
          provide: 'AUTH_SERVICE',
          useValue: {
            send: jest.fn(),
            connect: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    prismaService = module.get<PrismaService>(PrismaService);
    authClient = module.get<ClientProxy>('AUTH_SERVICE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFile', () => {
    it('should create a file and return the file response', async () => {
      const createFileDto = {
        fileName: 'testFile.jpg',
        fileType: AllowedFileType.JPG,
        storageKey: 'some-key',
      } as CreateFileDto;
      const userId = 1;

      const createdFile = {
        id: '1',
        ...createFileDto,
        userId,
      } as unknown as Files;

      const userResponse = {
        id: userId,
        name: 'John Doe',
      };

      jest.spyOn(prismaService.files, 'create').mockResolvedValue(createdFile);
      jest.spyOn(authClient, 'send').mockReturnValue(of(userResponse));

      const result = await service.createFile(userId, createFileDto);

      expect(result).toEqual({
        ...createdFile,
        author: plainToInstance(UserResponseDto, userResponse),
      });
    });

    it('should handle errors during file creation', async () => {
      const createFileDto = {
        fileName: 'testFile.txt',
        fileType: AllowedFileType.JPG,
        storageKey: 'some-key',
      } as CreateFileDto;
      const userId = 1;

      jest
        .spyOn(prismaService.files, 'create')
        .mockRejectedValue(new Error('Error creating file'));

      await expect(service.createFile(userId, createFileDto)).rejects.toThrow(
        'Error creating file',
      );
    });
  });

  describe('getPresignPutObject', () => {
    it('should return a presigned URL for putting an object', async () => {
      const getPresignPutObjectDto = {
        fileName: 'testFile.txt',
        contentType: 'text/plain',
      };
      const authUser = { id: 1 } as any;

      const presignedUrl = 'http://presigned-url.com';
      (getSignedUrl as jest.Mock).mockResolvedValue(presignedUrl);

      const result = await service.getPresignPutObject(
        getPresignPutObjectDto,
        authUser,
      );

      expect(result).toEqual({
        url: presignedUrl,
        storageKey: expect.any(String),
      });
    });

    it('should handle errors when generating a presigned URL', async () => {
      const getPresignPutObjectDto = {
        fileName: 'testFile.txt',
        contentType: 'text/plain',
      };
      const authUser = { id: 1 } as any;

      (getSignedUrl as jest.Mock).mockRejectedValue(
        new Error('Error generating presigned URL'),
      );

      await expect(
        service.getPresignPutObject(getPresignPutObjectDto, authUser),
      ).rejects.toThrow('Error generating presigned URL');
    });
  });

  describe('getPresignGetObject', () => {
    it('should return a presigned URL for getting an object', async () => {
      const fileId = '1';
      const file = {
        id: fileId,
        fileName: 'testFile.txt',
        fileType: 'text/plain',
        storageKey: 'some-key',
        storagePath: 'some/path',
        userId: 1,
      } as unknown as Files;

      const presignedUrl = 'http://presigned-url.com';
      (getSignedUrl as jest.Mock).mockResolvedValue(presignedUrl);
      jest.spyOn(prismaService.files, 'findUnique').mockResolvedValue(file);

      const result = await service.getPresignGetObject(fileId);

      expect(result).toEqual({ url: presignedUrl });
    });

    it('should throw a NotFoundException if file is not found', async () => {
      const fileId = '1';

      jest.spyOn(prismaService.files, 'findUnique').mockResolvedValue(null);

      await expect(service.getPresignGetObject(fileId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle errors when generating a presigned URL', async () => {
      const fileId = '1';
      const file = {
        id: fileId,
        fileName: 'testFile.txt',
        fileType: 'text/plain',
        storageKey: 'some-key',
        storagePath: 'some/path',
        userId: 1,
      } as unknown as Files;

      (getSignedUrl as jest.Mock).mockRejectedValue(
        new Error('Error generating presigned URL'),
      );
      jest.spyOn(prismaService.files, 'findUnique').mockResolvedValue(file);

      await expect(service.getPresignGetObject(fileId)).rejects.toThrow(
        'Error generating presigned URL',
      );
    });
  });
});
