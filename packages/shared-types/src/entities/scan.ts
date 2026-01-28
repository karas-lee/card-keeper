import type { ContactType } from "../enums";

export interface ParsedOcrResult {
  name: string | null;
  company: string | null;
  jobTitle: string | null;
  contactDetails: Array<{
    type: ContactType;
    value: string;
  }>;
  address: string | null;
  website: string | null;
}

export interface ScanResult {
  scanId: string;
  imageUrl: string;
  thumbnailUrl: string;
  ocrResult: {
    rawText: string;
    confidence: number;
    parsed: ParsedOcrResult;
  };
}
