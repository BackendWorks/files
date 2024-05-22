export interface GetPresignPutObjectResponse {
  url: string;
  fileId: string;
}

export interface GetPresignGetObjectResponse {
  url: string;
  name: string;
  createdAt: Date;
  id: string;
}

export interface IAuthUser {
  id: number;
  role: string;
  username: string;
  device_token: string;
}
