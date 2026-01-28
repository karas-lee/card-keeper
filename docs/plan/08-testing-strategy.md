# 08. 테스트 전략

---

## 1. 테스트 피라미드 & 커버리지 목표

```
         ┌──────┐
         │ E2E  │  핵심 흐름 100% (5-10 시나리오)
         │      │  Playwright (Web) / Detox (Mobile)
        ┌┴──────┴┐
        │ 통합    │  API 전체 엔드포인트 (40-60 테스트)
        │ 테스트  │  Vitest + Prisma Test
       ┌┴────────┴┐
       │ 단위 테스트│  핵심 로직 80%+ (100-200 테스트)
       │          │  Vitest
       └──────────┘
```

| 유형 | 도구 | 커버리지 목표 | 실행 환경 |
|------|------|-------------|----------|
| 단위 테스트 | Vitest | 핵심 로직 80%+ | CI + 로컬 |
| 통합 테스트 | Vitest + Prisma | API 전체 | CI (PostgreSQL) |
| E2E 테스트 | Playwright | 핵심 흐름 100% | CI |
| E2E 테스트 (모바일) | Detox | 핵심 흐름 | Manual / Nightly CI |
| 부하 테스트 | k6 | 출시 전 + 분기별 | 수동 실행 |

---

## 2. 단위 테스트 (Vitest)

### 2.1 설정

```typescript
// apps/web/vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    exclude: ["src/**/*.e2e.test.ts"],
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/lib/**/*.ts"],
      exclude: ["src/lib/db.ts", "src/**/*.test.ts"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### 2.2 테스트 대상 & 파일 구조

```
apps/web/src/
├── lib/
│   ├── auth/
│   │   ├── jwt.ts
│   │   ├── jwt.test.ts              # JWT 생성/검증/만료
│   │   ├── password.ts
│   │   └── password.test.ts          # 해싱/검증/강도
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── auth.service.test.ts      # 회원가입/로그인/잠금
│   │   ├── card.service.ts
│   │   ├── card.service.test.ts      # CRUD/필터/정렬/페이지네이션
│   │   ├── folder.service.ts
│   │   ├── folder.service.test.ts    # CRUD/트리/깊이 제한
│   │   ├── tag.service.ts
│   │   ├── tag.service.test.ts       # CRUD/개수 제한
│   │   ├── scan.service.ts
│   │   ├── scan.service.test.ts      # OCR 파이프라인 (mock)
│   │   ├── export.service.ts
│   │   ├── export.service.test.ts    # vCard/CSV 생성
│   │   ├── image.service.ts
│   │   └── image.service.test.ts     # 리사이즈/형식 변환
│   ├── ocr/
│   │   ├── text-parser.ts
│   │   ├── text-parser.test.ts       # OCR 텍스트 파싱
│   │   ├── regex-patterns.ts
│   │   └── regex-patterns.test.ts    # 정규식 패턴 매칭
│   ├── middleware/
│   │   ├── validate.ts
│   │   └── validate.test.ts          # Zod 검증 미들웨어
│   └── utils/
│       ├── api-response.ts
│       ├── api-response.test.ts
│       ├── pagination.ts
│       └── pagination.test.ts
│
packages/
├── shared-utils/src/
│   ├── schemas/
│   │   ├── auth.schema.test.ts       # 인증 스키마 검증
│   │   ├── card.schema.test.ts       # 명함 스키마 검증
│   │   ├── folder.schema.test.ts     # 폴더 스키마 검증
│   │   ├── tag.schema.test.ts        # 태그 스키마 검증
│   │   └── export.schema.test.ts     # 내보내기 스키마 검증
│   ├── formatters/
│   │   ├── phone.test.ts             # 전화번호 포맷팅
│   │   ├── date.test.ts              # 날짜 포맷팅
│   │   └── name.test.ts              # 이름 포맷팅
│   └── validators/
│       ├── email.test.ts             # 이메일 검증
│       ├── phone.test.ts             # 전화번호 검증
│       ├── url.test.ts               # URL 검증
│       └── password.test.ts          # 비밀번호 검증
```

### 2.3 주요 단위 테스트 케이스

#### JWT 테스트 (`jwt.test.ts`)
```typescript
describe("JWT", () => {
  describe("signAccessToken", () => {
    it("유효한 페이로드로 토큰 생성");
    it("15분 후 만료");
  });
  describe("verifyAccessToken", () => {
    it("유효한 토큰 검증 성공");
    it("만료된 토큰 거부");
    it("변조된 토큰 거부");
    it("잘못된 형식 거부");
  });
  describe("signRefreshToken / verifyRefreshToken", () => {
    it("Refresh Token 생성 및 검증");
    it("7일 후 만료");
    it("취소된 토큰 거부");
  });
});
```

#### 비밀번호 테스트 (`password.test.ts`)
```typescript
describe("Password", () => {
  it("bcrypt cost 12로 해싱");
  it("올바른 비밀번호 검증 성공");
  it("잘못된 비밀번호 검증 실패");
  describe("validatePasswordStrength", () => {
    it("8자 미만 거부");
    it("영문 없으면 거부");
    it("숫자 없으면 거부");
    it("특수문자 없으면 거부");
    it("모든 규칙 충족 시 통과");
  });
});
```

#### OCR 텍스트 파서 (`text-parser.test.ts`)
```typescript
describe("TextParser", () => {
  describe("이메일 추출", () => {
    it("표준 이메일 추출");
    it("여러 이메일 추출");
    it("잘못된 형식 제외");
  });
  describe("전화번호 추출", () => {
    it("한국 휴대폰 번호 추출 (010-xxxx-xxxx)");
    it("한국 일반 전화번호 추출 (02-xxx-xxxx)");
    it("국제 번호 추출 (+82-10-xxxx-xxxx)");
    it("팩스 번호 분류");
    it("MOBILE vs PHONE 분류");
  });
  describe("URL 추출", () => {
    it("http/https URL 추출");
    it("www 시작 URL 추출");
  });
  describe("이름/회사/직함 파싱", () => {
    it("한국어 명함 파싱");
    it("영어 명함 파싱");
    it("회사명 키워드 인식 (주식회사, Co., Ltd.)");
  });
});
```

#### vCard 생성 (`export.service.test.ts`)
```typescript
describe("ExportService", () => {
  describe("generateVCard", () => {
    it("vCard 3.0 형식 생성");
    it("vCard 4.0 형식 생성");
    it("한국어 이름 처리");
    it("여러 전화번호/이메일 포함");
    it("메모 포함");
    it("여러 명함 연결");
  });
  describe("generateCSV", () => {
    it("UTF-8 BOM 포함");
    it("헤더 행 포함");
    it("쉼표 포함 값 이스케이프");
    it("줄바꿈 포함 값 이스케이프");
  });
});
```

#### Zod 스키마 (`card.schema.test.ts`)
```typescript
describe("CardSchema", () => {
  describe("createCardSchema", () => {
    it("유효한 데이터 통과");
    it("이름 필수 검증");
    it("이름 100자 제한");
    it("메모 2000자 제한");
    it("잘못된 URL 거부");
    it("태그 10개 초과 거부");
    it("contactDetails 타입 검증");
  });
  describe("cardListQuerySchema", () => {
    it("기본값 적용 (limit=20, sort=createdAt, order=desc)");
    it("limit 1-100 범위 검증");
    it("잘못된 sort 거부");
  });
});
```

---

## 3. 통합 테스트 (API Route + Prisma)

### 3.1 테스트 DB 설정

```typescript
// apps/web/src/test/setup.ts
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient();

beforeAll(async () => {
  // 테스트 DB에 마이그레이션 적용
  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
  });
});

beforeEach(async () => {
  // 각 테스트 전 데이터 초기화
  await prisma.$transaction([
    prisma.cardTag.deleteMany(),
    prisma.contactDetail.deleteMany(),
    prisma.businessCard.deleteMany(),
    prisma.folder.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.loginAttempt.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.scanResult.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

### 3.2 통합 테스트 파일 구조

```
apps/web/src/app/api/v1/
├── auth/
│   ├── register/__tests__/route.test.ts
│   ├── login/__tests__/route.test.ts
│   ├── refresh/__tests__/route.test.ts
│   └── me/__tests__/route.test.ts
├── cards/
│   ├── __tests__/route.test.ts          # GET 목록, POST 생성
│   ├── [id]/__tests__/route.test.ts     # GET/PUT/DELETE
│   ├── [id]/favorite/__tests__/route.test.ts
│   ├── [id]/folder/__tests__/route.test.ts
│   ├── [id]/tags/__tests__/route.test.ts
│   └── batch/__tests__/
│       ├── delete.test.ts
│       ├── move.test.ts
│       └── tag.test.ts
├── scan/
│   ├── upload/__tests__/route.test.ts
│   └── confirm/__tests__/route.test.ts
├── folders/__tests__/route.test.ts
├── tags/__tests__/route.test.ts
└── export/
    ├── vcard/__tests__/route.test.ts
    └── csv/__tests__/route.test.ts
```

### 3.3 주요 통합 테스트 케이스

#### 인증 API
```typescript
describe("POST /api/v1/auth/register", () => {
  it("201: 회원가입 성공 → 사용자 생성 + 기본 폴더 생성");
  it("400: 유효하지 않은 이메일");
  it("400: 비밀번호 규칙 미충족");
  it("409: 이메일 중복");
});

describe("POST /api/v1/auth/login", () => {
  it("200: 로그인 성공 → JWT 반환");
  it("401: 잘못된 비밀번호");
  it("401: 존재하지 않는 이메일");
  it("403: 5회 실패 후 15분 잠금");
  it("401: 이메일 미인증 사용자");
});
```

#### 명함 API
```typescript
describe("GET /api/v1/cards", () => {
  it("200: 사용자별 목록 조회 (다른 사용자 카드 미포함)");
  it("200: 커서 기반 페이지네이션");
  it("200: 검색 필터 (이름)");
  it("200: 폴더 필터");
  it("200: 태그 필터 (OR 모드)");
  it("200: 태그 필터 (AND 모드)");
  it("200: 즐겨찾기 필터");
  it("200: 날짜 범위 필터");
  it("200: 정렬 (이름/최신/수정/회사)");
  it("401: 인증 없이 접근 거부");
});

describe("POST /api/v1/cards", () => {
  it("201: 명함 생성 (기본 필드)");
  it("201: 명함 생성 (연락처 + 태그 + 폴더)");
  it("400: 이름 미입력");
  it("400: 태그 10개 초과");
  it("403: 다른 사용자의 폴더 지정");
});

describe("DELETE /api/v1/cards/:id", () => {
  it("204: 명함 삭제 (연락처/태그 연결 cascade)");
  it("403: 다른 사용자의 명함 삭제 시도");
  it("404: 존재하지 않는 명함");
});
```

#### 일괄 작업
```typescript
describe("POST /api/v1/cards/batch/delete", () => {
  it("204: 일괄 삭제 성공");
  it("400: 빈 배열");
  it("400: 100개 초과");
  it("403: 다른 사용자의 카드 포함 시 전체 거부");
});
```

---

## 4. E2E 테스트 (Playwright - 웹)

### 4.1 설정

```typescript
// apps/web/playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html"],
    ["json", { outputFile: "test-results/results.json" }],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } },
  ],
  webServer: {
    command: "pnpm dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### 4.2 E2E 테스트 파일 구조

```
apps/web/e2e/
├── fixtures/
│   ├── auth.fixture.ts            # 인증된 사용자 fixture
│   └── data.fixture.ts            # 테스트 데이터 fixture
├── auth/
│   ├── login.spec.ts
│   ├── register.spec.ts
│   └── password-reset.spec.ts
├── cards/
│   ├── create-card.spec.ts
│   ├── view-cards.spec.ts
│   ├── edit-card.spec.ts
│   ├── delete-card.spec.ts
│   ├── favorite.spec.ts
│   └── batch-actions.spec.ts
├── scan/
│   ├── file-upload.spec.ts
│   └── ocr-confirm.spec.ts
├── folders/
│   └── folder-management.spec.ts
├── tags/
│   └── tag-management.spec.ts
├── export/
│   └── export-wizard.spec.ts
└── search/
    └── search-filter.spec.ts
```

### 4.3 핵심 E2E 시나리오

```typescript
// e2e/cards/create-card.spec.ts
test.describe("명함 수동 입력", () => {
  test("전체 흐름: 로그인 → 새 명함 → 입력 → 저장 → 목록 확인", async ({ page }) => {
    // 1. 로그인
    await page.goto("/login");
    await page.fill("[name=email]", "test@cardkeeper.app");
    await page.fill("[name=password]", "Test1234!");
    await page.click("button[type=submit]");
    await page.waitForURL("/cards");

    // 2. 새 명함 페이지 이동
    await page.click("[data-testid=new-card-button]");
    await page.waitForURL("/cards/new");

    // 3. 정보 입력
    await page.fill("[name=name]", "테스트 명함");
    await page.fill("[name=company]", "테스트 회사");
    await page.fill("[name=jobTitle]", "개발자");

    // 4. 연락처 추가
    await page.fill("[name='contactDetails.0.value']", "010-1234-5678");

    // 5. 저장
    await page.click("[data-testid=save-button]");

    // 6. 목록에서 확인
    await page.waitForURL("/cards");
    await expect(page.locator("text=테스트 명함")).toBeVisible();
  });
});

// e2e/scan/file-upload.spec.ts
test.describe("명함 스캔 (파일 업로드)", () => {
  test("전체 흐름: 이미지 업로드 → OCR → 확인 → 저장", async ({ page }) => {
    // 1. 스캔 페이지 이동
    await page.goto("/scan");

    // 2. 파일 업로드
    await page.setInputFiles("[data-testid=file-input]", "e2e/fixtures/sample-card.jpg");

    // 3. OCR 처리 대기
    await page.waitForURL(/\/scan\/confirm/);

    // 4. 결과 확인 (필드에 값이 채워져 있는지)
    await expect(page.locator("[name=name]")).not.toBeEmpty();

    // 5. 저장
    await page.click("[data-testid=save-button]");

    // 6. 목록에서 확인
    await page.waitForURL("/cards");
  });
});
```

---

## 5. E2E 테스트 (Detox - 모바일)

### 5.1 설정

```javascript
// apps/mobile/.detoxrc.js
module.exports = {
  testRunner: {
    args: {
      config: "e2e/jest.config.js",
    },
  },
  apps: {
    "ios.debug": {
      type: "ios.app",
      binaryPath: "ios/build/CardKeeper.app",
      build: "xcodebuild -workspace ios/CardKeeper.xcworkspace ...",
    },
    "android.debug": {
      type: "android.apk",
      binaryPath: "android/app/build/outputs/apk/debug/app-debug.apk",
      build: "cd android && ./gradlew assembleDebug",
    },
  },
  devices: {
    simulator: { type: "ios.simulator", device: { type: "iPhone 15" } },
    emulator: { type: "android.emulator", device: { avdName: "Pixel_7" } },
  },
};
```

### 5.2 핵심 모바일 E2E 시나리오

- 로그인 → 명함 목록 표시
- 명함 탭 → 상세 화면 표시
- (모의) 카메라 촬영 → OCR 결과 확인 → 저장
- Long Press → 다중 선택 → 일괄 삭제
- Pull-to-Refresh → 목록 갱신

---

## 6. 부하 테스트 (k6)

### 6.1 시나리오

```javascript
// k6/load-test.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 100 },   // Ramp up
    { duration: "5m", target: 100 },   // Sustain
    { duration: "1m", target: 500 },   // Peak
    { duration: "2m", target: 500 },   // Sustain peak
    { duration: "1m", target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],   // P95 < 500ms
    http_req_failed: ["rate<0.01"],     // 에러율 < 1%
  },
};

export default function () {
  // 1. 로그인
  const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify({
    email: `loadtest+${__VU}@cardkeeper.app`,
    password: "Test1234!",
  }), { headers: { "Content-Type": "application/json" } });

  check(loginRes, { "login 200": (r) => r.status === 200 });

  const token = JSON.parse(loginRes.body).data.accessToken;
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  // 2. 명함 목록 조회
  const listRes = http.get(`${BASE_URL}/api/v1/cards?limit=20`, { headers });
  check(listRes, { "list 200": (r) => r.status === 200 });

  // 3. 검색
  const searchRes = http.get(`${BASE_URL}/api/v1/cards?search=김&limit=20`, { headers });
  check(searchRes, { "search 200": (r) => r.status === 200 });

  sleep(1);
}
```

### 6.2 성능 목표

| 지표 | 목표 |
|------|------|
| API 응답 P95 (일반) | < 500ms |
| API 응답 P95 (OCR) | < 3s |
| 검색 (10,000건) | < 500ms |
| 동시 사용자 (MVP) | 1,000명 |
| 에러율 | < 0.1% |

---

## 7. 테스트 실행 명령어

```bash
# 단위 테스트
pnpm test                          # 전체
pnpm --filter web test             # 웹 단위 테스트
pnpm --filter shared-utils test    # 공유 유틸 단위 테스트

# 단위 테스트 (watch 모드)
pnpm --filter web test -- --watch

# 커버리지
pnpm --filter web test -- --coverage

# 통합 테스트
pnpm --filter web test:integration

# E2E 테스트 (웹)
pnpm --filter web test:e2e
pnpm --filter web exec playwright test --project=chromium

# E2E 테스트 (모바일)
pnpm --filter mobile detox test --configuration ios.sim.debug

# 부하 테스트
k6 run k6/load-test.js
```

---

**다음 문서:** [09-implementation-sequence.md](./09-implementation-sequence.md)
