export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  createdAt: Date;
}

export interface TagWithCount extends Tag {
  cardCount: number;
}
