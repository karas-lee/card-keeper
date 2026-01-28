export interface Folder {
  id: string;
  userId: string;
  parentId: string | null;
  name: string;
  color: string | null;
  order: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FolderTree extends Folder {
  children: FolderTree[];
  cardCount: number;
}
