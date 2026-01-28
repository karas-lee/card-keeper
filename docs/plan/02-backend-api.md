# 02. 백엔드 API & 핵심 기능

---

## 1. API Route 파일 구조

```
apps/web/src/app/api/v1/
├── auth/
│   ├── register/route.ts          # POST   회원가입
│   ├── login/route.ts             # POST   로그인
│   ├── logout/route.ts            # POST   로그아웃
│   ├── refresh/route.ts           # POST   토큰 갱신
│   ├── forgot-password/route.ts   # POST   비밀번호 재설정 요청
│   ├── reset-password/route.ts    # POST   비밀번호 재설정 실행
│   ├── verify-email/route.ts      # POST   이메일 인증
│   └── me/route.ts                # GET    현재 사용자 정보
├── cards/
│   ├── route.ts                   # GET 목록, POST 생성
│   ├── [id]/
│   │   ├── route.ts               # GET 상세, PUT 수정, DELETE 삭제
│   │   ├── favorite/route.ts      # PATCH  즐겨찾기 토글
│   │   ├── folder/route.ts        # PATCH  폴더 이동
│   │   └── tags/
│   │       ├── route.ts           # POST   태그 추가
│   │       └── [tagId]/route.ts   # DELETE 태그 제거
│   └── batch/
│       ├── delete/route.ts        # POST   일괄 삭제
│       ├── move/route.ts          # POST   일괄 폴더 이동
│       └── tag/route.ts           # POST   일괄 태그 추가
├── scan/
│   ├── upload/route.ts            # POST   이미지 업로드 + OCR
│   └── confirm/route.ts           # POST   OCR 결과 확인 → 명함 저장
├── folders/
│   ├── route.ts                   # GET 목록(트리), POST 생성
│   └── [id]/route.ts             # PUT 수정, DELETE 삭제
├── tags/
│   ├── route.ts                   # GET 목록, POST 생성
│   └── [id]/route.ts             # PUT 수정, DELETE 삭제
└── export/
    ├── vcard/route.ts             # POST   vCard 내보내기
    └── csv/route.ts               # POST   CSV 내보내기
```

---

## 2. 백엔드 라이브러리 구조

```
apps/web/src/lib/
├── auth/
│   ├── auth.config.ts             # Auth.js 설정
│   ├── auth.ts                    # NextAuth 인스턴스, handlers
│   ├── jwt.ts                     # jose를 사용한 JWT 생성/검증
│   ├── password.ts                # bcrypt 해싱/검증
│   └── firebase-admin.ts          # Firebase Admin SDK 초기화
├── services/
│   ├── auth.service.ts            # 인증 비즈니스 로직
│   ├── card.service.ts            # 명함 CRUD 로직
│   ├── folder.service.ts          # 폴더 관리 로직
│   ├── tag.service.ts             # 태그 관리 로직
│   ├── scan.service.ts            # OCR 파이프라인 로직
│   ├── export.service.ts          # 내보내기 로직
│   └── image.service.ts           # 이미지 처리 로직
├── middleware/
│   ├── auth.ts                    # 통합 인증 미들웨어
│   ├── validate.ts                # Zod 검증 미들웨어
│   ├── rate-limit.ts              # Rate Limiting
│   └── error-handler.ts           # 에러 핸들링
├── ocr/
│   ├── vision-client.ts           # Tesseract.js OCR 클라이언트 (Worker Pool + Dual-pass)
│   ├── text-parser.ts             # OCR 텍스트 파싱/구조화
│   └── regex-patterns.ts          # 이메일/전화/URL 정규식 패턴
├── storage/
│   ├── s3-client.ts               # AWS S3 클라이언트
│   └── presigned-url.ts           # Presigned URL 생성
├── utils/
│   ├── api-response.ts            # 표준 API 응답 헬퍼
│   ├── pagination.ts              # 커서 기반 페이지네이션
│   └── search.ts                  # Full-Text Search 빌더
└── db.ts                          # Prisma Client 싱글턴
```

---

## 3. 인증 시스템

### 3.1 JWT 토큰 관리 (`lib/auth/jwt.ts`)

```typescript
// jose 라이브러리 사용
import * as jose from "jose";

interface TokenPayload {
  userId: string;
  email: string;
  name: string | null;
}

// Access Token: 15분, RS256 또는 HS256
async function signAccessToken(payload: TokenPayload): Promise<string>;
async function verifyAccessToken(token: string): Promise<TokenPayload>;

// Refresh Token: 7일, DB 저장 (RefreshToken 테이블)
async function signRefreshToken(userId: string): Promise<string>;
async function verifyRefreshToken(token: string): Promise<{ userId: string }>;
async function revokeRefreshToken(token: string): Promise<void>;
```

### 3.2 비밀번호 처리 (`lib/auth/password.ts`)

```typescript
// bcrypt cost 12
async function hashPassword(password: string): Promise<string>;
async function verifyPassword(password: string, hash: string): Promise<boolean>;

// 비밀번호 규칙: 8자 이상, 영문+숫자+특수문자
function validatePasswordStrength(password: string): { valid: boolean; errors: string[] };
```

### 3.3 로그인 잠금

- `LoginAttempt` 테이블에 실패 기록 저장
- 5회 연속 실패 → 15분 잠금
- 잠금 해제 후 카운터 리셋

### 3.4 Firebase 토큰 검증 (`lib/auth/firebase-admin.ts`)

```typescript
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Firebase Admin SDK로 모바일 ID Token 검증
async function verifyFirebaseToken(idToken: string): Promise<{
  uid: string;
  email: string;
  name: string | null;
  provider: AuthProvider;
}>;
```

### 3.5 통합 인증 미들웨어 (`lib/middleware/auth.ts`)

```typescript
interface AuthContext {
  userId: string;
  email: string;
  name: string | null;
  source: "authjs" | "firebase";
}

/**
 * 요청의 Authorization 헤더 또는 Cookie에서 토큰 추출
 * 1. Bearer Token → JWT 검증 (자체 발급 토큰)
 * 2. Firebase Token → Firebase Admin 검증
 * 3. Auth.js Session → getServerSession 사용
 * → 통합 AuthContext 반환
 */
async function withAuth(
  handler: (req: NextRequest, ctx: AuthContext) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse>;
```

---

## 4. 명함 CRUD

### 4.1 `POST /api/v1/cards` - 명함 생성 (수동 입력)

**Zod 스키마:**
```typescript
const createCardSchema = z.object({
  name: z.string().min(1).max(100),
  company: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  website: z.string().url().max(500).optional().or(z.literal("")),
  memo: z.string().max(2000).optional(),
  folderId: z.string().cuid().optional(),
  tagIds: z.array(z.string().cuid()).max(10).optional(),
  contactDetails: z.array(z.object({
    type: z.enum(["PHONE", "EMAIL", "FAX", "MOBILE", "OTHER"]),
    label: z.string().max(50).optional(),
    value: z.string().min(1).max(200),
    isPrimary: z.boolean().default(false),
  })).optional(),
});
```

**응답:** `201 Created`
```json
{
  "data": {
    "id": "clx...",
    "name": "김철수",
    "company": "테크코리아",
    ...
  }
}
```

**구현 핵심:**
- `contactDetails`는 중첩 create로 한 트랜잭션에 처리
- `tagIds` 전달 시 CardTag 레코드 동시 생성
- `folderId` 유효성은 해당 유저 소유 폴더인지 확인

### 4.2 `GET /api/v1/cards` - 목록 조회

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `search` | string | Full-text 검색어 |
| `folderId` | string | 폴더 필터 |
| `tagIds` | string (comma-separated) | 태그 필터 |
| `tagMode` | "AND" \| "OR" | 태그 필터 모드 (기본: OR) |
| `isFavorite` | boolean | 즐겨찾기 필터 |
| `company` | string | 회사명 필터 |
| `startDate` | ISO date | 등록일 시작 |
| `endDate` | ISO date | 등록일 끝 |
| `sort` | "name" \| "createdAt" \| "updatedAt" \| "company" | 정렬 기준 |
| `order` | "asc" \| "desc" | 정렬 방향 |
| `cursor` | string | 페이지네이션 커서 |
| `limit` | number (1-100, default 20) | 페이지 크기 |

**Zod 스키마:**
```typescript
const listCardsQuerySchema = z.object({
  search: z.string().max(100).optional(),
  folderId: z.string().cuid().optional(),
  tagIds: z.string().optional(),                // "id1,id2,id3"
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
```

**응답:** `200 OK`
```json
{
  "data": [/* BusinessCard[] with relations */],
  "meta": {
    "nextCursor": "clx...",
    "hasMore": true,
    "totalCount": 156
  }
}
```

**구현 핵심:**
- `search` 사용 시 PostgreSQL tsvector Full-Text Search 사용
- 커서 기반 페이지네이션: `cursor` 이후 레코드 반환
- `tagMode=AND`: 모든 지정 태그를 가진 카드만 반환 (HAVING COUNT = tag 수)
- `include`: folder, tags (via CardTag → Tag), contactDetails

### 4.3 `GET /api/v1/cards/:id` - 상세 조회

**응답:** `200 OK`
```json
{
  "data": {
    "id": "...",
    "name": "...",
    "company": "...",
    "jobTitle": "...",
    "address": "...",
    "website": "...",
    "memo": "...",
    "imageUrl": "...",
    "thumbnailUrl": "...",
    "ocrRawText": "...",
    "ocrConfidence": 0.97,
    "scanMethod": "OCR_CAMERA",
    "isFavorite": true,
    "folder": { "id": "...", "name": "...", "color": "..." },
    "tags": [{ "id": "...", "name": "...", "color": "..." }],
    "contactDetails": [
      { "id": "...", "type": "PHONE", "label": "업무용", "value": "...", "isPrimary": true }
    ],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**구현 핵심:**
- userId 일치 확인 (소유권 검증)
- 모든 관계 include

### 4.4 `PUT /api/v1/cards/:id` - 수정

**Zod 스키마:** `createCardSchema`와 동일하되 모든 필드 optional

**구현 핵심:**
- `contactDetails` 업데이트 시: 기존 삭제 → 새로 생성 (deleteMany + createMany 트랜잭션)
- `tagIds` 업데이트 시: 기존 CardTag 삭제 → 새로 생성

### 4.5 `DELETE /api/v1/cards/:id` - 삭제

**구현 핵심:**
- S3 이미지 삭제 (원본 + 썸네일)
- Prisma cascade로 contactDetails, CardTag 자동 삭제

### 4.6 `PATCH /api/v1/cards/:id/favorite` - 즐겨찾기 토글

**요청:**
```json
{ "isFavorite": true }
```

**구현 핵심:** 단일 필드 업데이트, Optimistic Update 대상

### 4.7 `PATCH /api/v1/cards/:id/folder` - 폴더 이동

**요청:**
```json
{ "folderId": "clx..." }  // null 허용 (미분류로 이동)
```

### 4.8 `POST /api/v1/cards/:id/tags` - 태그 추가

**요청:**
```json
{ "tagId": "clx..." }
```

**구현 핵심:** 명함당 최대 10개 태그 확인

### 4.9 `DELETE /api/v1/cards/:id/tags/:tagId` - 태그 제거

### 4.10 일괄 작업

**`POST /api/v1/cards/batch/delete`**
```json
{ "cardIds": ["id1", "id2", "id3"] }
```

**`POST /api/v1/cards/batch/move`**
```json
{
  "cardIds": ["id1", "id2", "id3"],
  "folderId": "clx..."              // null 허용
}
```

**`POST /api/v1/cards/batch/tag`**
```json
{
  "cardIds": ["id1", "id2", "id3"],
  "tagIds": ["tag1", "tag2"],
  "action": "add"                    // "add" | "remove"
}
```

**구현 핵심:**
- 최대 100개 제한
- 트랜잭션으로 처리
- 소유권 일괄 검증

---

## 5. OCR 파이프라인

### 5.1 `POST /api/v1/scan/upload` - 이미지 업로드 + OCR

**요청:** `multipart/form-data`
| 필드 | 타입 | 설명 |
|------|------|------|
| `image` | File | 명함 이미지 (JPEG/PNG/HEIC, 최대 10MB) |

**처리 파이프라인:**

```
1. 이미지 수신 (multipart/form-data)
     ↓
2. 이미지 검증 (Sharp)
   - 형식: JPEG, PNG, HEIC, WEBP
   - 크기: 최대 10MB
   - HEIC → JPEG 변환
     ↓
3. S3 업로드
   - 원본: originals/{userId}/{scanId}/{filename}
   - 썸네일 생성 (200x200) + 업로드
     ↓
4. Tesseract.js OCR (Dual-pass, vision-client.ts)
   - Worker Pool (기본 2개, OCR_POOL_SIZE 환경변수로 조정)
   - Worker 파라미터: PSM.SPARSE_TEXT, DPI 300, 단어간 공백 유지
   - 전략 A (밝은 배경): resize(3000) → grayscale → normalize → sharpen → threshold(140)
   - 전략 B (어두운 배경): resize(3000) → grayscale → negate → normalize → sharpen → threshold(140)
   - 두 전략을 병렬 실행 → confidence가 높은 결과 선택
   - rotateAuto: true 로 기울어진 명함 자동 보정
   - 지원 언어: kor+eng+jpn
     ↓
5. 텍스트 파싱/구조화 (text-parser.ts)
   - 이메일: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
   - 전화번호: /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/g
   - URL: /https?:\/\/[^\s]+/g 또는 /www\.[^\s]+/g
   - 이름/회사/직함: 위치 기반 휴리스틱
     - 첫 줄 or 가장 큰 폰트 → 이름
     - 두 번째 줄 → 직함 or 회사
     - 나머지: 주소, 기타 정보
     ↓
6. ScanResult 임시 저장 (DB)
     ↓
7. 응답 반환
```

**응답:** `200 OK`
```json
{
  "data": {
    "scanId": "scan_abc123",
    "imageUrl": "https://cdn.../original.jpg",
    "thumbnailUrl": "https://cdn.../thumb.jpg",
    "ocrResult": {
      "rawText": "김철수\nCTO\n테크코리아...",
      "confidence": 0.97,
      "parsed": {
        "name": "김철수",
        "company": "테크코리아 주식회사",
        "jobTitle": "CTO",
        "contactDetails": [
          { "type": "EMAIL", "value": "chulsoo@techkorea.com" },
          { "type": "PHONE", "value": "010-1234-5678" }
        ],
        "address": "서울시 강남구...",
        "website": "www.techkorea.com"
      }
    }
  }
}
```

### 5.2 `POST /api/v1/scan/confirm` - OCR 결과 확인 후 저장

**요청:**
```json
{
  "scanId": "scan_abc123",
  "name": "김철수",
  "company": "테크코리아 주식회사",
  "jobTitle": "CTO",
  "contactDetails": [
    { "type": "EMAIL", "value": "chulsoo@techkorea.com", "isPrimary": true },
    { "type": "PHONE", "value": "010-1234-5678", "isPrimary": true }
  ],
  "address": "서울시 강남구...",
  "website": "https://www.techkorea.com",
  "memo": "",
  "folderId": "clx...",
  "tagIds": ["tag1"]
}
```

**구현 핵심:**
- ScanResult에서 이미지 URL 참조
- 사용자 수정 내용으로 BusinessCard 생성
- ScanResult의 ocrRawText, ocrConfidence를 BusinessCard에 저장
- scanMethod: OCR_CAMERA 또는 OCR_GALLERY

### 5.3 OCR 텍스트 파서 상세 (`ocr/text-parser.ts`)

```typescript
interface ParsedOcrResult {
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

// 정규식 패턴 (regex-patterns.ts)
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/g;
const URL_REGEX = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\/[^\s]*)?/g;
const FAX_REGEX = /[Ff](?:ax|AX)[\s:]*(\+?\d[\d\s\-().]{6,})/g;

// 전화번호 분류: MOBILE vs PHONE
// 한국: 010, 011, 016, 017, 018, 019 → MOBILE
// 그 외: PHONE
function classifyPhoneNumber(phone: string): "MOBILE" | "PHONE";

// 위치 기반 이름/직함/회사 추론
// 1. 이메일/전화/팩스/URL/주소를 제외한 텍스트 라인 추출
// 2. 첫 번째 라인 → 이름 후보
// 3. 두 번째 라인 → 직함 후보
// 4. 세 번째 라인 → 회사 후보
// 5. "주식회사", "Co.", "Ltd.", "Inc." 포함 라인 → 회사 우선
function parseNameCompanyTitle(lines: string[]): {
  name: string | null;
  company: string | null;
  jobTitle: string | null;
};
```

---

## 6. 폴더 관리

### 6.1 `GET /api/v1/folders` - 폴더 목록 (트리 구조)

**응답:**
```json
{
  "data": [
    {
      "id": "...",
      "name": "IT 업계",
      "color": "#6366F1",
      "order": 0,
      "isDefault": false,
      "cardCount": 23,
      "children": [
        {
          "id": "...",
          "name": "스타트업",
          "color": "#8B5CF6",
          "order": 0,
          "cardCount": 8,
          "children": []
        }
      ]
    },
    {
      "id": "...",
      "name": "미분류",
      "color": "#9CA3AF",
      "order": 999,
      "isDefault": true,
      "cardCount": 45,
      "children": []
    }
  ]
}
```

**구현 핵심:**
- 최상위 폴더 조회 후 children 포함 (1단계 하위폴더까지만)
- 각 폴더별 `_count.cards` 포함
- 기본 "미분류" 폴더는 회원가입 시 자동 생성

### 6.2 `POST /api/v1/folders` - 폴더 생성

**Zod 스키마:**
```typescript
const createFolderSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#6366F1"),
  parentId: z.string().cuid().optional(), // null = 최상위 폴더
});
```

**구현 핵심:**
- `parentId` 지정 시 부모 폴더가 최상위(parentId=null)인지 확인 (1단계까지만)
- `@@unique([userId, name, parentId])` 중복 검사
- Free 요금제: 최대 5개 제한

### 6.3 `PUT /api/v1/folders/:id` - 폴더 수정

```typescript
const updateFolderSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  order: z.number().int().min(0).optional(),
});
```

**구현 핵심:** 기본(isDefault) 폴더는 이름 변경 불가

### 6.4 `DELETE /api/v1/folders/:id` - 폴더 삭제

**구현 핵심:**
- 기본 폴더 삭제 불가
- 폴더 내 명함은 `folderId = null` (미분류)로 이동
- 하위 폴더는 최상위로 승격 또는 함께 삭제 (query param으로 제어)

---

## 7. 태그 관리

### 7.1 `GET /api/v1/tags` - 태그 목록

**응답:**
```json
{
  "data": [
    {
      "id": "...",
      "name": "VIP",
      "color": "#EF4444",
      "cardCount": 12,
      "createdAt": "..."
    }
  ]
}
```

### 7.2 `POST /api/v1/tags` - 태그 생성

**Zod 스키마:**
```typescript
const createTagSchema = z.object({
  name: z.string().min(1).max(30),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#8B5CF6"),
});
```

**구현 핵심:**
- `@@unique([userId, name])` 중복 검사
- Free 요금제: 최대 10개 제한

### 7.3 `PUT /api/v1/tags/:id` - 태그 수정

### 7.4 `DELETE /api/v1/tags/:id` - 태그 삭제

**구현 핵심:** CardTag cascade 삭제로 연결 자동 제거

---

## 8. 내보내기

### 8.1 `POST /api/v1/export/vcard` - vCard 내보내기

**요청:**
```json
{
  "version": "3.0",             // "3.0" | "4.0"
  "scope": "selected",          // "single" | "selected" | "folder" | "tag" | "all"
  "cardIds": ["id1", "id2"],    // scope=selected 시
  "folderId": "...",            // scope=folder 시
  "tagId": "...",               // scope=tag 시
}
```

**응답:** `200 OK` (Content-Type: text/vcard)
```
BEGIN:VCARD
VERSION:3.0
FN:김철수
ORG:테크코리아 주식회사
TITLE:CTO
TEL;TYPE=WORK:010-1234-5678
EMAIL;TYPE=WORK:chulsoo@techkorea.com
ADR;TYPE=WORK:;;서울시 강남구...
URL:https://www.techkorea.com
NOTE:메모 내용
END:VCARD
```

**구현 핵심:**
- vCard 3.0: RFC 2426 준수, 더 넓은 호환성
- vCard 4.0: RFC 6350 준수, UTF-8 기본
- 여러 장일 경우 하나의 .vcf 파일에 연결

### 8.2 `POST /api/v1/export/csv` - CSV 내보내기

**요청:** vCard와 동일한 scope/filter 구조

**응답:** `200 OK` (Content-Type: text/csv)
- UTF-8 BOM (0xEF, 0xBB, 0xBF) 포함 (Excel 호환)
- 헤더: 이름, 회사, 직함, 전화번호(기본), 이메일(기본), 주소, 웹사이트, 메모, 폴더, 태그, 등록일

**구현 핵심:**
- 1,000건 5초 이내 생성
- 스트리밍 응답으로 대용량 처리

---

## 9. 검색 & 필터

### 9.1 PostgreSQL Full-Text Search

**검색 대상 필드:**
- `name`, `company`, `jobTitle`, `address`, `website`, `memo`
- `contactDetails.value` (전화번호, 이메일)

**tsvector 컬럼:**
- `BusinessCard` 테이블에 `searchVector tsvector` 컬럼 추가
- 트리거로 INSERT/UPDATE 시 자동 갱신

**GIN 인덱스:**
```sql
CREATE INDEX idx_cards_search ON "BusinessCard" USING GIN ("searchVector");
```

**검색 쿼리 구성:**
```typescript
// plainto_tsquery로 사용자 입력을 tsquery로 변환
// 한국어: simple 딕셔너리 사용 (형태소 분석은 pg_bigm 또는 trigram)
// 영어: english 딕셔너리 사용

function buildSearchQuery(search: string): Prisma.Sql {
  // LIKE 폴백: tsvector로 매칭 안 될 경우 ILIKE 사용
  // 한국어 부분 검색: trigram 유사도 검색 (pg_trgm)
}
```

### 9.2 커서 기반 페이지네이션

```typescript
interface PaginationResult<T> {
  data: T[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
    totalCount: number;
  };
}

function buildCursorPagination(params: {
  cursor?: string;
  limit: number;
  sort: string;
  order: "asc" | "desc";
}): {
  skip: number;
  take: number;
  cursor?: { id: string };
  orderBy: Record<string, "asc" | "desc">;
};
```

---

## 10. 미들웨어 & 보안

### 10.1 Zod 검증 미들웨어

```typescript
function withValidation<T extends z.ZodType>(schema: T) {
  return (handler: (req: NextRequest, data: z.infer<T>, ctx: AuthContext) => Promise<NextResponse>) =>
    async (req: NextRequest) => {
      const body = await req.json();
      const result = schema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({
          error: {
            code: "VALIDATION_ERROR",
            message: "입력값이 올바르지 않습니다.",
            details: result.error.issues.map(issue => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          },
        }, { status: 400 });
      }
      // ... handler 호출
    };
}
```

### 10.2 Rate Limiting

```typescript
// 메모리 기반 (Vercel Serverless에서는 Upstash Redis 권장)
// MVP에서는 간단한 메모리 기반 구현 후 필요 시 Redis로 전환

interface RateLimitConfig {
  windowMs: number;     // 시간 창 (ms)
  maxRequests: number;  // 최대 요청 수
}

const rateLimits: Record<string, RateLimitConfig> = {
  "auth/login": { windowMs: 15 * 60 * 1000, maxRequests: 10 },
  "auth/register": { windowMs: 60 * 60 * 1000, maxRequests: 5 },
  "scan/upload": { windowMs: 60 * 1000, maxRequests: 10 },
  "default": { windowMs: 60 * 1000, maxRequests: 100 },
};
```

### 10.3 CORS 설정

```typescript
const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL,
  "cardkeeper://",  // 모바일 딥링크 스킴
];
```

### 10.4 에러 핸들링 (RFC 7807)

```typescript
class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: Array<{ field?: string; message: string }>,
  ) {
    super(message);
  }
}

// 표준 에러 응답 생성
function createErrorResponse(error: AppError): NextResponse {
  return NextResponse.json({
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
  }, { status: error.statusCode });
}

// 에러 코드 상수
// shared-constants/src/error-codes.ts 에 정의
// VALIDATION_ERROR, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT,
// RATE_LIMIT_EXCEEDED, INTERNAL_ERROR, OCR_FAILED, UPLOAD_FAILED, ...
```

---

## 11. 이미지 처리

### 11.1 Sharp 처리 파이프라인

```typescript
// lib/services/image.service.ts

async function processCardImage(buffer: Buffer, mimeType: string): Promise<{
  original: Buffer;
  thumbnail: Buffer;
  format: "jpeg" | "png";
}> {
  let image = sharp(buffer);

  // 1. HEIC → JPEG 변환
  if (mimeType === "image/heic" || mimeType === "image/heif") {
    image = image.jpeg({ quality: 90 });
  }

  // 2. EXIF 기반 자동 회전
  image = image.rotate();

  // 3. 원본 리사이즈 (최대 2048px)
  const original = await image
    .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  // 4. 썸네일 생성 (200x200, cover)
  const thumbnail = await sharp(buffer)
    .rotate()
    .resize(200, 200, { fit: "cover" })
    .jpeg({ quality: 70 })
    .toBuffer();

  return { original, thumbnail, format: "jpeg" };
}
```

### 11.2 지원 형식

| 형식 | MIME | 비고 |
|------|------|------|
| JPEG | image/jpeg | 기본 형식 |
| PNG | image/png | 투명 배경 지원 |
| HEIC | image/heic, image/heif | iOS 기본, JPEG로 변환 |
| WebP | image/webp | 최신 브라우저 |

### 11.3 파일 크기 제한

- **업로드 최대:** 10MB (원본)
- **저장 원본:** 최대 2048px, JPEG 85% 품질 → ~500KB-1MB
- **썸네일:** 200x200, JPEG 70% 품질 → ~10-30KB

---

**다음 문서:** [03-frontend-web.md](./03-frontend-web.md)
