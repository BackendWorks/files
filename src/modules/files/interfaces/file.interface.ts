export interface IGetPresignPutObjectResponse {
  url: string;
  storageKey: string;
  fileName: string;
}

export interface IAuthUser {
  id: string;
  role: string;
  username: string;
  email: string;
}
