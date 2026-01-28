export interface CreateFolderRequest {
  name: string;
  color?: string;
  parentId?: string;
}

export interface UpdateFolderRequest {
  name?: string;
  color?: string;
  order?: number;
}
