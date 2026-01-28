import type { ContactType, ScanMethod } from "../enums";

export interface BusinessCard {
  id: string;
  userId: string;
  folderId: string | null;
  name: string;
  company: string | null;
  jobTitle: string | null;
  address: string | null;
  website: string | null;
  memo: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  ocrRawText: string | null;
  ocrConfidence: number | null;
  scanMethod: ScanMethod;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactDetail {
  id: string;
  cardId: string;
  type: ContactType;
  label: string | null;
  value: string;
  isPrimary: boolean;
}

export interface FolderInfo {
  id: string;
  name: string;
  color: string | null;
}

export interface TagInfo {
  id: string;
  name: string;
  color: string | null;
}

export interface CardSummary extends BusinessCard {
  folder: FolderInfo | null;
  tags: TagInfo[];
  contactDetails: ContactDetail[];
}

export type CardDetail = CardSummary;
