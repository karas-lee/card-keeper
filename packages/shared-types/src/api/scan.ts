import type { ContactType } from "../enums";
import type { ParsedOcrResult } from "../entities/scan";

export interface ScanUploadResponse {
  scanId: string;
  imageUrl: string;
  thumbnailUrl: string;
  ocrResult: {
    rawText: string;
    confidence: number;
    parsed: ParsedOcrResult;
  };
}

export interface ScanConfirmRequest {
  scanId: string;
  name: string;
  company?: string;
  jobTitle?: string;
  contactDetails?: Array<{
    type: ContactType;
    label?: string;
    value: string;
    isPrimary?: boolean;
  }>;
  address?: string;
  website?: string;
  memo?: string;
  folderId?: string;
  tagIds?: string[];
}
