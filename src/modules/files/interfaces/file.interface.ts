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
  id: string;
  role: string;
}
