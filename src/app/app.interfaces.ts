export interface CreateFileCallDto {
  fileName: string;
  storageKey: string;
  type: string;
  userId: string;
}

export interface UpdateFileCallDto {
  fileId: string;
  storageKey: string;
}
