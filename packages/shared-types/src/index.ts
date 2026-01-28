// Enums
export { AuthProvider, ScanMethod, ContactType, ScanStatus } from "./enums";

// Entity types
export type { User } from "./entities/user";
export type {
  BusinessCard,
  ContactDetail,
  FolderInfo,
  TagInfo,
  CardSummary,
  CardDetail,
} from "./entities/card";
export type { Folder, FolderTree } from "./entities/folder";
export type { Tag, TagWithCount } from "./entities/tag";
export type { ParsedOcrResult, ScanResult } from "./entities/scan";

// API types
export type { ApiResponse, PaginatedResponse, ApiError } from "./api/common";
export type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  TokenResponse,
  RefreshRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "./api/auth";
export type {
  CardListParams,
  CreateCardRequest,
  UpdateCardRequest,
  BatchDeleteRequest,
  BatchMoveRequest,
  BatchTagRequest,
} from "./api/cards";
export type { CreateFolderRequest, UpdateFolderRequest } from "./api/folders";
export type { CreateTagRequest, UpdateTagRequest } from "./api/tags";
export type { ScanUploadResponse, ScanConfirmRequest } from "./api/scan";
export type { ExportParams } from "./api/export";

// Store types
export type { AuthState, UiState, DraftState } from "./stores";
