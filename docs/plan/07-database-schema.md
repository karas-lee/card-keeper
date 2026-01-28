# 07. 데이터베이스 스키마 & 마이그레이션

---

## 1. Prisma Schema 전체

### 1.1 데이터소스 & 제너레이터

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
```

### 1.2 User 모델

```prisma
model User {
  id            String        @id @default(cuid())
  email         String        @unique
  name          String?
  passwordHash  String?
  avatarUrl     String?
  authProvider  AuthProvider   @default(EMAIL)
  firebaseUid   String?       @unique
  emailVerified DateTime?

  // Relations
  cards         BusinessCard[]
  folders       Folder[]
  tags          Tag[]
  accounts      Account[]
  sessions      Session[]
  refreshTokens RefreshToken[]
  loginAttempts LoginAttempt[]

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([email])
  @@index([firebaseUid])
}
```

### 1.3 BusinessCard 모델

```prisma
model BusinessCard {
  id             String          @id @default(cuid())
  userId         String
  folderId       String?
  name           String
  company        String?
  jobTitle       String?
  address        String?
  website        String?
  memo           String?         @db.Text
  imageUrl       String?
  thumbnailUrl   String?
  ocrRawText     String?         @db.Text
  ocrConfidence  Float?
  scanMethod     ScanMethod      @default(MANUAL)
  isFavorite     Boolean         @default(false)

  // Relations
  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  folder         Folder?         @relation(fields: [folderId], references: [id], onDelete: SetNull)
  contactDetails ContactDetail[]
  tags           CardTag[]

  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  // Indexes
  @@index([userId])
  @@index([folderId])
  @@index([userId, name])
  @@index([userId, company])
  @@index([userId, createdAt(sort: Desc)])
  @@index([userId, isFavorite])
  @@index([userId, updatedAt(sort: Desc)])
}
```

### 1.4 ContactDetail 모델

```prisma
model ContactDetail {
  id        String      @id @default(cuid())
  cardId    String
  type      ContactType
  label     String?
  value     String
  isPrimary Boolean     @default(false)

  card      BusinessCard @relation(fields: [cardId], references: [id], onDelete: Cascade)

  @@index([cardId])
  @@index([cardId, type])
}
```

### 1.5 Folder 모델

```prisma
model Folder {
  id        String    @id @default(cuid())
  userId    String
  parentId  String?
  name      String
  color     String?   @default("#6366F1")
  order     Int       @default(0)
  isDefault Boolean   @default(false)

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent    Folder?   @relation("FolderHierarchy", fields: [parentId], references: [id], onDelete: SetNull)
  children  Folder[]  @relation("FolderHierarchy")
  cards     BusinessCard[]

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@unique([userId, name, parentId])
  @@index([userId])
  @@index([parentId])
  @@index([userId, order])
}
```

### 1.6 Tag 모델

```prisma
model Tag {
  id        String    @id @default(cuid())
  userId    String
  name      String
  color     String?   @default("#8B5CF6")

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  cards     CardTag[]

  createdAt DateTime  @default(now())

  @@unique([userId, name])
  @@index([userId])
}
```

### 1.7 CardTag 모델 (N:M Join Table)

```prisma
model CardTag {
  cardId     String
  tagId      String

  card       BusinessCard @relation(fields: [cardId], references: [id], onDelete: Cascade)
  tag        Tag          @relation(fields: [tagId], references: [id], onDelete: Cascade)
  assignedAt DateTime     @default(now())

  @@id([cardId, tagId])
  @@index([cardId])
  @@index([tagId])
}
```

### 1.8 Auth.js 관련 모델 (Account, Session, VerificationToken)

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### 1.9 RefreshToken 모델

```prisma
model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@index([expiresAt])
}
```

### 1.10 PasswordResetToken 모델

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())

  @@index([email])
  @@index([token])
}
```

### 1.11 LoginAttempt 모델

```prisma
model LoginAttempt {
  id        String   @id @default(cuid())
  userId    String?
  email     String
  ipAddress String?
  success   Boolean
  createdAt DateTime @default(now())

  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([email, createdAt])
  @@index([userId, createdAt])
}
```

### 1.12 ScanResult 모델 (OCR 임시 결과)

```prisma
model ScanResult {
  id            String   @id @default(cuid())
  userId        String
  imageUrl      String
  thumbnailUrl  String?
  rawText       String?  @db.Text
  confidence    Float?
  parsedData    Json?    // ParsedOcrResult as JSON
  status        ScanStatus @default(PENDING)
  createdAt     DateTime @default(now())
  expiresAt     DateTime // 24시간 후 자동 삭제

  @@index([userId])
  @@index([expiresAt])
}
```

### 1.13 Enum 정의

```prisma
enum AuthProvider {
  EMAIL
  GOOGLE
  APPLE
  KAKAO
}

enum ScanMethod {
  OCR_CAMERA
  OCR_GALLERY
  MANUAL
}

enum ContactType {
  PHONE
  EMAIL
  FAX
  MOBILE
  OTHER
}

enum ScanStatus {
  PENDING      // OCR 완료, 사용자 확인 대기
  CONFIRMED    // 사용자 확인 → BusinessCard 생성됨
  EXPIRED      // 만료 (24시간)
}
```

---

## 2. 인덱스 전략

### 2.1 인덱스 요약

| 테이블 | 인덱스 | 타입 | 용도 |
|--------|--------|------|------|
| User | `email` | UNIQUE | 로그인, 중복 확인 |
| User | `firebaseUid` | UNIQUE | 모바일 인증 |
| BusinessCard | `userId` | B-TREE | 사용자별 카드 조회 |
| BusinessCard | `folderId` | B-TREE | 폴더별 카드 조회 |
| BusinessCard | `userId, name` | B-TREE(복합) | 이름순 정렬 |
| BusinessCard | `userId, company` | B-TREE(복합) | 회사명순 정렬/필터 |
| BusinessCard | `userId, createdAt DESC` | B-TREE(복합) | 최신순 정렬 |
| BusinessCard | `userId, updatedAt DESC` | B-TREE(복합) | 수정순 정렬 |
| BusinessCard | `userId, isFavorite` | B-TREE(복합) | 즐겨찾기 필터 |
| BusinessCard | `searchVector` | GIN | Full-Text Search |
| ContactDetail | `cardId` | B-TREE | 카드별 연락처 |
| ContactDetail | `cardId, type` | B-TREE(복합) | 타입별 필터 |
| Folder | `userId` | B-TREE | 사용자별 폴더 |
| Folder | `parentId` | B-TREE | 하위 폴더 조회 |
| Folder | `userId, name, parentId` | UNIQUE(복합) | 이름 중복 방지 |
| Tag | `userId` | B-TREE | 사용자별 태그 |
| Tag | `userId, name` | UNIQUE(복합) | 이름 중복 방지 |
| CardTag | `cardId` | B-TREE | 카드별 태그 |
| CardTag | `tagId` | B-TREE | 태그별 카드 |
| RefreshToken | `token` | UNIQUE | 토큰 조회 |
| RefreshToken | `expiresAt` | B-TREE | 만료 토큰 정리 |
| LoginAttempt | `email, createdAt` | B-TREE(복합) | 로그인 시도 조회 |

### 2.2 성능 고려사항

- **커서 기반 페이지네이션:** `WHERE id > cursor ORDER BY createdAt DESC` → `(userId, createdAt DESC)` 인덱스 활용
- **Full-Text Search:** GIN 인덱스로 tsvector 검색 최적화
- **N+1 방지:** Prisma `include`로 관계 데이터 한 번에 조회
- **카운트 최적화:** `_count` 사용, 전체 카운트는 캐시 또는 approximate count 고려

---

## 3. Full-Text Search 마이그레이션

### 3.1 tsvector 컬럼 추가 마이그레이션

```sql
-- migrations/XXXXXXXX_add_full_text_search/migration.sql

-- 1. pg_trgm 확장 (한국어 부분 검색용)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. searchVector 컬럼 추가
ALTER TABLE "BusinessCard"
ADD COLUMN "searchVector" tsvector;

-- 3. GIN 인덱스 생성
CREATE INDEX idx_cards_search
ON "BusinessCard" USING GIN ("searchVector");

-- 4. trigram 인덱스 (한국어 LIKE 검색 보조)
CREATE INDEX idx_cards_name_trgm
ON "BusinessCard" USING GIN ("name" gin_trgm_ops);

CREATE INDEX idx_cards_company_trgm
ON "BusinessCard" USING GIN ("company" gin_trgm_ops);

-- 5. searchVector 업데이트 함수
CREATE OR REPLACE FUNCTION update_card_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('simple', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.company, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW."jobTitle", '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.address, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(NEW.website, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(NEW.memo, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. 트리거 생성
CREATE TRIGGER trg_card_search_vector
BEFORE INSERT OR UPDATE OF name, company, "jobTitle", address, website, memo
ON "BusinessCard"
FOR EACH ROW
EXECUTE FUNCTION update_card_search_vector();

-- 7. 기존 데이터 업데이트
UPDATE "BusinessCard" SET
  "searchVector" =
    setweight(to_tsvector('simple', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(company, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE("jobTitle", '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(address, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(website, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(memo, '')), 'D');
```

### 3.2 검색 쿼리 전략

```typescript
// lib/utils/search.ts

/**
 * 검색 전략 (우선순위 순):
 * 1. tsvector Full-Text Search (영문, 완전 단어 매칭)
 * 2. ILIKE (한국어 부분 문자열 매칭)
 * 3. pg_trgm similarity (유사 검색, 오타 허용)
 */
function buildSearchWhere(search: string, userId: string) {
  return Prisma.sql`
    "userId" = ${userId}
    AND (
      -- tsvector 매칭
      "searchVector" @@ plainto_tsquery('simple', ${search})
      OR
      -- 한국어/부분 문자열 ILIKE
      "name" ILIKE ${`%${search}%`}
      OR "company" ILIKE ${`%${search}%`}
      OR "jobTitle" ILIKE ${`%${search}%`}
      OR
      -- ContactDetail 검색 (서브쿼리)
      EXISTS (
        SELECT 1 FROM "ContactDetail"
        WHERE "ContactDetail"."cardId" = "BusinessCard".id
        AND "ContactDetail".value ILIKE ${`%${search}%`}
      )
    )
  `;
}
```

### 3.3 가중치 설명

| 가중치 | 필드 | 비고 |
|--------|------|------|
| A (최고) | name | 이름 검색 최우선 |
| B (높음) | company, jobTitle | 회사명/직함 |
| C (보통) | address, website | 주소/웹사이트 |
| D (낮음) | memo | 메모 |

---

## 4. Seed 스크립트

### 4.1 `prisma/seed.ts`

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // 1. 테스트 사용자 생성
  const passwordHash = await bcrypt.hash("Test1234!", 12);

  const user = await prisma.user.upsert({
    where: { email: "test@cardkeeper.app" },
    update: {},
    create: {
      email: "test@cardkeeper.app",
      name: "테스트 사용자",
      passwordHash,
      authProvider: "EMAIL",
      emailVerified: new Date(),
    },
  });

  // 2. 기본 "미분류" 폴더 생성
  const defaultFolder = await prisma.folder.upsert({
    where: {
      userId_name_parentId: {
        userId: user.id,
        name: "미분류",
        parentId: null,
      },
    },
    update: {},
    create: {
      userId: user.id,
      name: "미분류",
      color: "#9CA3AF",
      order: 999,
      isDefault: true,
    },
  });

  // 3. 샘플 폴더
  const itFolder = await prisma.folder.create({
    data: {
      userId: user.id,
      name: "IT 업계",
      color: "#6366F1",
      order: 0,
    },
  });

  // 4. 샘플 태그
  const vipTag = await prisma.tag.create({
    data: {
      userId: user.id,
      name: "VIP",
      color: "#EF4444",
    },
  });

  const partnerTag = await prisma.tag.create({
    data: {
      userId: user.id,
      name: "파트너",
      color: "#3B82F6",
    },
  });

  // 5. 샘플 명함
  const card = await prisma.businessCard.create({
    data: {
      userId: user.id,
      folderId: itFolder.id,
      name: "김철수",
      company: "테크코리아 주식회사",
      jobTitle: "CTO",
      address: "서울시 강남구 테헤란로 123",
      website: "https://www.techkorea.com",
      memo: "2026년 1월 CES 컨퍼런스에서 만남",
      scanMethod: "MANUAL",
      isFavorite: true,
      contactDetails: {
        create: [
          { type: "PHONE", label: "업무용", value: "010-1234-5678", isPrimary: true },
          { type: "EMAIL", label: "업무용", value: "chulsoo@techkorea.com", isPrimary: true },
        ],
      },
      tags: {
        create: [
          { tagId: vipTag.id },
          { tagId: partnerTag.id },
        ],
      },
    },
  });

  console.log("Seed completed:", { user: user.id, folder: itFolder.id, card: card.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 4.2 `package.json` seed 설정

```json
// apps/web/package.json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

## 5. 마이그레이션 전략

### 5.1 환경별 전략

| 환경 | 명령어 | 설명 |
|------|--------|------|
| **Development** | `prisma migrate dev` | 개발 중 스키마 변경 + 마이그레이션 파일 생성 |
| **Staging** | `prisma migrate deploy` | CI/CD에서 자동 실행, 마이그레이션 적용만 |
| **Production** | `prisma migrate deploy` | Vercel Deploy Hook에서 실행 |

### 5.2 마이그레이션 워크플로

```
1. 개발자가 schema.prisma 수정
   ↓
2. `pnpm db:migrate:dev` 실행
   → 마이그레이션 SQL 파일 자동 생성
   → 로컬 DB에 적용
   → Prisma Client 재생성
   ↓
3. PR 생성 (마이그레이션 파일 포함)
   ↓
4. CI에서 테스트 DB로 `prisma migrate deploy` 실행
   ↓
5. PR 머지 → Staging 배포
   → `prisma migrate deploy` 자동 실행
   ↓
6. Production 배포
   → `prisma migrate deploy` 자동 실행
```

### 5.3 Neon 브랜칭

- **Main Branch:** Production DB
- **Dev Branch:** 개발/테스트용 (PR별 자동 생성 가능)
- **Point-in-Time Recovery:** 프로덕션 롤백용

### 5.4 주의사항

- 마이그레이션은 **항상 하위 호환** 유지 (컬럼 삭제 전 nullable로 변경 등)
- 대용량 테이블 마이그레이션은 **별도 스크립트** 로 처리
- Full-Text Search 관련 SQL은 **수동 마이그레이션** (`prisma migrate dev --create-only`)

---

## 6. ER 다이어그램 (관계 요약)

```
User (1) ──── (N) BusinessCard (N) ──── (M) Tag [via CardTag]
  │                    │
  │ (1:N)              │ (1:N)
  │                    │
  ├── Folder (1) ──── (N) BusinessCard
  │     │
  │     └── (Self 1:N) Folder (parent-child, 1단계)
  │
  ├── Account (Auth.js OAuth, 1:N)
  ├── Session (Auth.js Session, 1:N)
  ├── RefreshToken (JWT Refresh, 1:N)
  └── LoginAttempt (로그인 시도 기록, 1:N)

BusinessCard (1) ──── (N) ContactDetail

별도: VerificationToken, PasswordResetToken, ScanResult
```

---

**다음 문서:** [08-testing-strategy.md](./08-testing-strategy.md)
