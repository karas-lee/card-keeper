import type { ContactType } from "../enums";

export interface CardListParams {
  search?: string;
  folderId?: string;
  tagIds?: string[];
  tagMode?: "AND" | "OR";
  isFavorite?: boolean;
  company?: string;
  startDate?: string;
  endDate?: string;
  sort?: "name" | "createdAt" | "updatedAt" | "company";
  order?: "asc" | "desc";
  cursor?: string;
  limit?: number;
}

export interface CreateCardRequest {
  name: string;
  company?: string;
  jobTitle?: string;
  address?: string;
  website?: string;
  memo?: string;
  folderId?: string;
  tagIds?: string[];
  contactDetails?: Array<{
    type: ContactType;
    label?: string;
    value: string;
    isPrimary?: boolean;
  }>;
}

export type UpdateCardRequest = Partial<CreateCardRequest>;

export interface BatchDeleteRequest {
  cardIds: string[];
}

export interface BatchMoveRequest {
  cardIds: string[];
  folderId: string | null;
}

export interface BatchTagRequest {
  cardIds: string[];
  tagIds: string[];
  action: "add" | "remove";
}
