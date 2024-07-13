import { registerAs } from '@nestjs/config';

export default registerAs(
  'aws',
  (): Record<string, any> => ({
    region: process.env.AWS_S3_REGION,
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,

    bucket: process.env.AWS_S3_BUCKET,
  }),
);
