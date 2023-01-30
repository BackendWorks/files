import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
config();

interface Config {
  rb_url: string;
  servicePort: string;
  database_uri: string;
  presignExpire: string;
  bucket: string;
  files_queue: string;
  auth_queue: string;
  env: string;
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
}

@Injectable()
export class ConfigService {
  private config = {} as Config;
  constructor() {
    this.config.rb_url = process.env.RABBITMQ_URL;
    this.config.servicePort = process.env.PORT;
    this.config.database_uri = process.env.FILES_MONGO_URI;
    this.config.presignExpire = process.env.AWS_EXPIRE_LINK;
    this.config.bucket = process.env.AWS_BUCKET;
    this.config.files_queue = process.env.RABBITMQ_FILES_QUEUE;
    this.config.auth_queue = process.env.RABBITMQ_AUTH_QUEUE;
    this.config.env = process.env.NODE_ENV;
    this.config.aws = {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION,
    };
  }

  public get(key: keyof Config): any {
    return this.config[key];
  }
}
