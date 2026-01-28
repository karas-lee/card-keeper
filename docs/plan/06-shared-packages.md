# 06. 공유 패키지 상세

---

## 1. `@cardkeeper/shared-types` - 타입 정의

### 1.1 패키지 구조

```
packages/shared-types/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts               # 전체 export
    ├── entities/
    │   ├── user.ts
    │   ├── card.ts
    │   ├── folder.ts
    │   ├── tag.ts
    │   └── scan.ts
    ├── api/
    │   ├── auth.ts
    │   ├── cards.ts
    │   ├── folders.ts
    │   ├── tags.ts
    │   ├── scan.ts
    │   ├── export.ts
    │   └── common.ts
    ├── enums.ts
    └── stores.ts
```

### 1.2 Entity 타입

```typescript
// entities/user.ts
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  authProvider: AuthProvider;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// entities/card.ts
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

// 리스트 응답용 (관계 포함)
export interface CardSummary extends BusinessCard {
  folder: FolderInfo | null;
  tags: TagInfo[];
  contactDetails: ContactDetail[];
}

export interface CardDetail extends CardSummary {
  // 상세 조회 시 추가 정보 (현재 동일, 향후 확장)
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

// entities/folder.ts
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

// entities/tag.ts
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

// entities/scan.ts
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
```

### 1.3 API 타입

```typescript
// api/common.ts
export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
    totalCount: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field?: string;
      message: string;
    }>;
  };
}

// api/auth.ts
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// api/cards.ts
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

export interface UpdateCardRequest extends Partial<CreateCardRequest> {}

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

// api/folders.ts
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

// api/tags.ts
export interface CreateTagRequest {
  name: string;
  color?: string;
}

export interface UpdateTagRequest {
  name?: string;
  color?: string;
}

// api/scan.ts
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

// api/export.ts
export interface ExportParams {
  version?: "3.0" | "4.0";      // vCard only
  scope: "single" | "selected" | "folder" | "tag" | "all";
  cardIds?: string[];            // scope=selected
  folderId?: string;             // scope=folder
  tagId?: string;                // scope=tag
}
```

### 1.4 Enum 타입

```typescript
// enums.ts
export enum AuthProvider {
  EMAIL = "EMAIL",
  GOOGLE = "GOOGLE",
  APPLE = "APPLE",
  KAKAO = "KAKAO",
}

export enum ScanMethod {
  OCR_CAMERA = "OCR_CAMERA",
  OCR_GALLERY = "OCR_GALLERY",
  MANUAL = "MANUAL",
}

export enum ContactType {
  PHONE = "PHONE",
  EMAIL = "EMAIL",
  FAX = "FAX",
  MOBILE = "MOBILE",
  OTHER = "OTHER",
}
```

---

## 2. `@cardkeeper/shared-utils` - Zod 스키마 & 유틸리티

### 2.1 패키지 구조

```
packages/shared-utils/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    ├── schemas/
    │   ├── auth.schema.ts
    │   ├── card.schema.ts
    │   ├── folder.schema.ts
    │   ├── tag.schema.ts
    │   ├── scan.schema.ts
    │   ├── export.schema.ts
    │   └── common.schema.ts
    ├── formatters/
    │   ├── phone.ts
    │   ├── date.ts
    │   └── name.ts
    └── validators/
        ├── email.ts
        ├── phone.ts
        ├── url.ts
        └── password.ts
```

### 2.2 Zod 스키마

```typescript
// schemas/auth.schema.ts
import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "비밀번호는 8자 이상이어야 합니다")
  .regex(/[a-zA-Z]/, "영문자를 포함해야 합니다")
  .regex(/[0-9]/, "숫자를 포함해야 합니다")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "특수문자를 포함해야 합니다");

export const registerSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요").max(50),
  email: z.string().email("유효한 이메일 주소를 입력해주세요"),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

// schemas/card.schema.ts
export const contactDetailSchema = z.object({
  type: z.enum(["PHONE", "EMAIL", "FAX", "MOBILE", "OTHER"]),
  label: z.string().max(50).optional(),
  value: z.string().min(1, "값을 입력해주세요").max(200),
  isPrimary: z.boolean().default(false),
});

export const createCardSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요").max(100),
  company: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  website: z.string().url("유효한 URL을 입력해주세요").max(500)
    .optional().or(z.literal("")),
  memo: z.string().max(2000).optional(),
  folderId: z.string().cuid().optional().nullable(),
  tagIds: z.array(z.string().cuid()).max(10, "태그는 최대 10개까지 추가할 수 있습니다").optional(),
  contactDetails: z.array(contactDetailSchema).optional(),
});

export const updateCardSchema = createCardSchema.partial();

export const cardListQuerySchema = z.object({
  search: z.string().max(100).optional(),
  folderId: z.string().cuid().optional(),
  tagIds: z.string().optional(),
  tagMode: z.enum(["AND", "OR"]).default("OR"),
  isFavorite: z.coerce.boolean().optional(),
  company: z.string().max(100).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sort: z.enum(["name", "createdAt", "updatedAt", "company"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  cursor: z.string().cuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const batchDeleteSchema = z.object({
  cardIds: z.array(z.string().cuid()).min(1).max(100),
});

export const batchMoveSchema = z.object({
  cardIds: z.array(z.string().cuid()).min(1).max(100),
  folderId: z.string().cuid().nullable(),
});

export const batchTagSchema = z.object({
  cardIds: z.array(z.string().cuid()).min(1).max(100),
  tagIds: z.array(z.string().cuid()).min(1).max(10),
  action: z.enum(["add", "remove"]),
});

// schemas/folder.schema.ts
export const createFolderSchema = z.object({
  name: z.string().min(1, "폴더 이름을 입력해주세요").max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "유효한 HEX 색상을 입력해주세요")
    .default("#6366F1"),
  parentId: z.string().cuid().optional().nullable(),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  order: z.number().int().min(0).optional(),
});

// schemas/tag.schema.ts
export const createTagSchema = z.object({
  name: z.string().min(1, "태그 이름을 입력해주세요").max(30),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#8B5CF6"),
});

export const updateTagSchema = z.object({
  name: z.string().min(1).max(30).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

// schemas/scan.schema.ts
export const scanConfirmSchema = z.object({
  scanId: z.string().min(1),
  name: z.string().min(1).max(100),
  company: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
  contactDetails: z.array(contactDetailSchema).optional(),
  address: z.string().max(500).optional(),
  website: z.string().url().max(500).optional().or(z.literal("")),
  memo: z.string().max(2000).optional(),
  folderId: z.string().cuid().optional().nullable(),
  tagIds: z.array(z.string().cuid()).max(10).optional(),
});

// schemas/export.schema.ts
export const exportSchema = z.object({
  version: z.enum(["3.0", "4.0"]).optional(),
  scope: z.enum(["single", "selected", "folder", "tag", "all"]),
  cardIds: z.array(z.string().cuid()).optional(),
  folderId: z.string().cuid().optional(),
  tagId: z.string().cuid().optional(),
}).refine((data) => {
  if (data.scope === "selected" && (!data.cardIds || data.cardIds.length === 0)) {
    return false;
  }
  if (data.scope === "folder" && !data.folderId) return false;
  if (data.scope === "tag" && !data.tagId) return false;
  return true;
}, { message: "범위에 맞는 ID를 지정해주세요" });
```

### 2.3 포맷터

```typescript
// formatters/phone.ts
export function formatPhoneNumber(phone: string, locale: string = "ko"): string {
  const digits = phone.replace(/\D/g, "");
  if (locale === "ko") {
    // 010-1234-5678
    if (digits.length === 11 && digits.startsWith("010")) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }
    // 02-1234-5678
    if (digits.startsWith("02")) {
      return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    // 031-123-4567
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone; // 기타 로캘은 원본 반환
}

// formatters/date.ts
export function formatDate(date: Date | string, format: "short" | "long" | "relative" = "short"): string;
export function formatRelativeTime(date: Date | string): string;

// formatters/name.ts
export function formatDisplayName(name: string, company?: string | null): string;
```

### 2.4 밸리데이터

```typescript
// validators/email.ts
export function isValidEmail(email: string): boolean;

// validators/phone.ts
export function isValidPhone(phone: string): boolean;
export function isKoreanMobile(phone: string): boolean;

// validators/url.ts
export function isValidUrl(url: string): boolean;

// validators/password.ts
export function getPasswordStrength(password: string): "weak" | "medium" | "strong";
export function validatePasswordRules(password: string): {
  hasMinLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
};
```

---

## 3. `@cardkeeper/shared-constants` - 상수

### 3.1 패키지 구조

```
packages/shared-constants/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    ├── error-codes.ts
    ├── limits.ts
    ├── config.ts
    └── theme.ts
```

### 3.2 에러 코드

```typescript
// error-codes.ts
export const ERROR_CODES = {
  // 인증
  UNAUTHORIZED: "UNAUTHORIZED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",

  // 검증
  VALIDATION_ERROR: "VALIDATION_ERROR",

  // 리소스
  NOT_FOUND: "NOT_FOUND",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",

  // 제한
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  LIMIT_EXCEEDED: "LIMIT_EXCEEDED",        // 요금제 제한 초과
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  UNSUPPORTED_FORMAT: "UNSUPPORTED_FORMAT",

  // OCR
  OCR_FAILED: "OCR_FAILED",
  OCR_LOW_CONFIDENCE: "OCR_LOW_CONFIDENCE",

  // 내보내기
  EXPORT_FAILED: "EXPORT_FAILED",
  EXPORT_TOO_MANY: "EXPORT_TOO_MANY",

  // 서버
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
```

### 3.3 제한값

```typescript
// limits.ts
export const LIMITS = {
  // 요금제별 제한
  FREE: {
    MAX_CARDS: 200,
    MAX_OCR_SCANS_PER_MONTH: 30,
    MAX_FOLDERS: 5,
    MAX_TAGS: 10,
    EXPORT_SINGLE_ONLY: true,
  },
  PRO: {
    MAX_CARDS: Infinity,
    MAX_OCR_SCANS_PER_MONTH: Infinity,
    MAX_FOLDERS: Infinity,
    MAX_TAGS: Infinity,
    EXPORT_SINGLE_ONLY: false,
  },

  // 공통 제한
  MAX_TAGS_PER_CARD: 10,
  MAX_CONTACT_DETAILS_PER_CARD: 20,
  MAX_BATCH_SIZE: 100,
  MAX_FOLDER_DEPTH: 1,              // 하위 폴더 1단계
  MAX_CARDS_PER_USER: 50_000,

  // 이미지
  MAX_IMAGE_SIZE: 10 * 1024 * 1024,  // 10MB
  THUMBNAIL_SIZE: 200,               // 200x200px
  ORIGINAL_MAX_DIMENSION: 2048,      // 최대 2048px

  // 검색
  SEARCH_DEBOUNCE_MS: 300,
  MAX_RECENT_SEARCHES: 10,

  // 페이지네이션
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // 인증
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_MINUTES: 15,
  ACCESS_TOKEN_EXPIRY_MINUTES: 15,
  REFRESH_TOKEN_EXPIRY_DAYS: 7,
  PASSWORD_RESET_EXPIRY_HOURS: 1,
  EMAIL_VERIFY_EXPIRY_HOURS: 24,

  // 비밀번호
  MIN_PASSWORD_LENGTH: 8,

  // 텍스트
  MAX_NAME_LENGTH: 100,
  MAX_COMPANY_LENGTH: 100,
  MAX_JOB_TITLE_LENGTH: 100,
  MAX_ADDRESS_LENGTH: 500,
  MAX_WEBSITE_LENGTH: 500,
  MAX_MEMO_LENGTH: 2000,
  MAX_FOLDER_NAME_LENGTH: 50,
  MAX_TAG_NAME_LENGTH: 30,
  MAX_LABEL_LENGTH: 50,
} as const;
```

### 3.4 설정값

```typescript
// config.ts
export const CONFIG = {
  // 지원 이미지 형식
  SUPPORTED_IMAGE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/heic",
    "image/heif",
    "image/webp",
  ] as const,

  SUPPORTED_IMAGE_EXTENSIONS: [
    ".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp",
  ] as const,

  // OCR 지원 언어
  OCR_SUPPORTED_LANGUAGES: ["ko", "en", "ja", "zh"] as const,

  // 명함 비율 (가이드용)
  BUSINESS_CARD_ASPECT_RATIO: 1.75,  // 3.5:2

  // 기본 색상
  DEFAULT_FOLDER_COLOR: "#6366F1",
  DEFAULT_TAG_COLOR: "#8B5CF6",

  // 프리셋 색상 (폴더/태그용)
  PRESET_COLORS: [
    "#EF4444", "#F97316", "#F59E0B", "#84CC16",
    "#10B981", "#06B6D4", "#3B82F6", "#6366F1",
    "#8B5CF6", "#A855F7", "#EC4899", "#F43F5E",
  ] as const,

  // vCard 버전
  VCARD_VERSIONS: ["3.0", "4.0"] as const,

  // 내보내기 범위
  EXPORT_SCOPES: ["single", "selected", "folder", "tag", "all"] as const,

  // 정렬 옵션
  SORT_OPTIONS: ["name", "createdAt", "updatedAt", "company"] as const,
} as const;
```

### 3.5 테마

```typescript
// theme.ts
export const THEME = {
  colors: {
    primary: {
      50: "#EEF2FF",
      100: "#E0E7FF",
      200: "#C7D2FE",
      300: "#A5B4FC",
      400: "#818CF8",
      500: "#6366F1",
      600: "#4F46E5",
      700: "#4338CA",
      800: "#3730A3",
      900: "#312E81",
      950: "#1E1B4B",
    },
  },
  fonts: {
    sans: "Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  },
} as const;
```

---

## 4. `@cardkeeper/api-client` - HTTP 클라이언트

### 4.1 패키지 구조

```
packages/api-client/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts                # ApiClient export
    ├── client.ts               # HTTP Client 베이스 클래스
    ├── endpoints/
    │   ├── auth.ts
    │   ├── cards.ts
    │   ├── folders.ts
    │   ├── tags.ts
    │   ├── scan.ts
    │   └── export.ts
    ├── query-keys.ts           # TanStack Query Key 팩토리
    └── errors.ts               # API 에러 클래스
```

### 4.2 HTTP Client 클래스

```typescript
// client.ts
import type { ApiError } from "@cardkeeper/shared-types";

export class HttpClient {
  private baseUrl: string;
  private getToken: () => string | null;
  private onUnauthorized: () => void;

  constructor(config: {
    baseUrl: string;
    getToken: () => string | null;
    onUnauthorized: () => void;
  }) {
    this.baseUrl = config.baseUrl;
    this.getToken = config.getToken;
    this.onUnauthorized = config.onUnauthorized;
  }

  private async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      params?: Record<string, string | number | boolean | undefined>;
      headers?: Record<string, string>;
      isFormData?: boolean;
    }
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.set(key, String(value));
      });
    }

    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!options?.isFormData ? { "Content-Type": "application/json" } : {}),
      ...options?.headers,
    };

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: options?.isFormData
        ? (options.body as FormData)
        : options?.body
          ? JSON.stringify(options.body)
          : undefined,
    });

    if (response.status === 401) {
      this.onUnauthorized();
      throw new ApiClientError("UNAUTHORIZED", "인증이 필요합니다", 401);
    }

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new ApiClientError(
        error.error.code,
        error.error.message,
        response.status,
        error.error.details
      );
    }

    // Blob 응답 (내보내기)
    if (response.headers.get("content-type")?.includes("text/")) {
      return response.blob() as unknown as T;
    }

    // 204 No Content
    if (response.status === 204) return undefined as T;

    return response.json();
  }

  get<T>(path: string, params?: Record<string, any>) {
    return this.request<T>("GET", path, { params });
  }

  post<T>(path: string, body?: unknown, options?: { isFormData?: boolean }) {
    return this.request<T>("POST", path, { body, ...options });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>("PUT", path, { body });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>("PATCH", path, { body });
  }

  delete<T>(path: string) {
    return this.request<T>("DELETE", path);
  }
}
```

### 4.3 엔드포인트별 함수

```typescript
// endpoints/auth.ts
export function createAuthEndpoints(client: HttpClient) {
  return {
    register: (data: RegisterRequest) =>
      client.post<ApiResponse<AuthResponse>>("/auth/register", data)
        .then(r => r.data),

    login: (data: LoginRequest) =>
      client.post<ApiResponse<AuthResponse>>("/auth/login", data)
        .then(r => r.data),

    logout: () =>
      client.post<void>("/auth/logout"),

    refresh: (data: RefreshRequest) =>
      client.post<ApiResponse<TokenResponse>>("/auth/refresh", data)
        .then(r => r.data),

    forgotPassword: (data: ForgotPasswordRequest) =>
      client.post<void>("/auth/forgot-password", data),

    resetPassword: (data: ResetPasswordRequest) =>
      client.post<void>("/auth/reset-password", data),

    verifyEmail: (token: string) =>
      client.post<void>("/auth/verify-email", { token }),

    getMe: () =>
      client.get<ApiResponse<User>>("/auth/me").then(r => r.data),
  };
}

// endpoints/cards.ts
export function createCardsEndpoints(client: HttpClient) {
  return {
    list: (params: CardListParams) => {
      const queryParams: Record<string, any> = {
        ...params,
        tagIds: params.tagIds?.join(","),
      };
      return client.get<PaginatedResponse<CardSummary>>("/cards", queryParams);
    },

    get: (id: string) =>
      client.get<ApiResponse<CardDetail>>(`/cards/${id}`).then(r => r.data),

    create: (data: CreateCardRequest) =>
      client.post<ApiResponse<CardDetail>>("/cards", data).then(r => r.data),

    update: (id: string, data: UpdateCardRequest) =>
      client.put<ApiResponse<CardDetail>>(`/cards/${id}`, data).then(r => r.data),

    delete: (id: string) =>
      client.delete<void>(`/cards/${id}`),

    toggleFavorite: (id: string, isFavorite: boolean) =>
      client.patch<void>(`/cards/${id}/favorite`, { isFavorite }),

    moveToFolder: (id: string, folderId: string | null) =>
      client.patch<void>(`/cards/${id}/folder`, { folderId }),

    addTag: (id: string, tagId: string) =>
      client.post<void>(`/cards/${id}/tags`, { tagId }),

    removeTag: (id: string, tagId: string) =>
      client.delete<void>(`/cards/${id}/tags/${tagId}`),

    batchDelete: (cardIds: string[]) =>
      client.post<void>("/cards/batch/delete", { cardIds }),

    batchMove: (cardIds: string[], folderId: string | null) =>
      client.post<void>("/cards/batch/move", { cardIds, folderId }),

    batchTag: (cardIds: string[], tagIds: string[], action: "add" | "remove") =>
      client.post<void>("/cards/batch/tag", { cardIds, tagIds, action }),
  };
}

// endpoints/scan.ts
export function createScanEndpoints(client: HttpClient) {
  return {
    upload: (image: File | Blob) => {
      const formData = new FormData();
      formData.append("image", image);
      return client.post<ApiResponse<ScanUploadResponse>>(
        "/scan/upload",
        formData,
        { isFormData: true }
      ).then(r => r.data);
    },

    confirm: (data: ScanConfirmRequest) =>
      client.post<ApiResponse<CardDetail>>("/scan/confirm", data)
        .then(r => r.data),
  };
}

// endpoints/folders.ts
export function createFoldersEndpoints(client: HttpClient) {
  return {
    list: () =>
      client.get<ApiResponse<FolderTree[]>>("/folders").then(r => r.data),

    create: (data: CreateFolderRequest) =>
      client.post<ApiResponse<Folder>>("/folders", data).then(r => r.data),

    update: (id: string, data: UpdateFolderRequest) =>
      client.put<ApiResponse<Folder>>(`/folders/${id}`, data).then(r => r.data),

    delete: (id: string) =>
      client.delete<void>(`/folders/${id}`),
  };
}

// endpoints/tags.ts
export function createTagsEndpoints(client: HttpClient) {
  return {
    list: () =>
      client.get<ApiResponse<TagWithCount[]>>("/tags").then(r => r.data),

    create: (data: CreateTagRequest) =>
      client.post<ApiResponse<Tag>>("/tags", data).then(r => r.data),

    update: (id: string, data: UpdateTagRequest) =>
      client.put<ApiResponse<Tag>>(`/tags/${id}`, data).then(r => r.data),

    delete: (id: string) =>
      client.delete<void>(`/tags/${id}`),
  };
}

// endpoints/export.ts
export function createExportEndpoints(client: HttpClient) {
  return {
    vcard: (params: ExportParams) =>
      client.post<Blob>("/export/vcard", params),

    csv: (params: ExportParams) =>
      client.post<Blob>("/export/csv", params),
  };
}
```

### 4.4 ApiClient 조합

```typescript
// index.ts
import { HttpClient } from "./client";
import { createAuthEndpoints } from "./endpoints/auth";
import { createCardsEndpoints } from "./endpoints/cards";
import { createScanEndpoints } from "./endpoints/scan";
import { createFoldersEndpoints } from "./endpoints/folders";
import { createTagsEndpoints } from "./endpoints/tags";
import { createExportEndpoints } from "./endpoints/export";

export function createApiClient(config: {
  baseUrl: string;
  getToken: () => string | null;
  onUnauthorized: () => void;
}) {
  const client = new HttpClient(config);

  return {
    auth: createAuthEndpoints(client),
    cards: createCardsEndpoints(client),
    scan: createScanEndpoints(client),
    folders: createFoldersEndpoints(client),
    tags: createTagsEndpoints(client),
    export: createExportEndpoints(client),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

export { queryKeys } from "./query-keys";
export { ApiClientError } from "./errors";
```

### 4.5 플랫폼별 초기화

```typescript
// apps/web/src/lib/api.ts
import { createApiClient } from "@cardkeeper/api-client";
import { useAuthStore } from "@/stores/auth-store";

export const apiClient = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_APP_URL + "/api/v1",
  getToken: () => useAuthStore.getState().accessToken,
  onUnauthorized: () => useAuthStore.getState().logout(),
});

// apps/mobile/src/lib/api.ts
import { createApiClient } from "@cardkeeper/api-client";
import { useAuthStore } from "@/stores/auth-store";

export const apiClient = createApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL!,
  getToken: () => useAuthStore.getState().accessToken,
  onUnauthorized: () => useAuthStore.getState().logout(),
});
```

---

**다음 문서:** [07-database-schema.md](./07-database-schema.md)
