# CardKeeper

명함을 촬영하거나 수동 입력하여 디지털로 관리하는 웹 & 모바일 앱.

## 기술 스택

| 영역 | 기술 |
|------|------|
| Monorepo | Turborepo + pnpm workspace |
| Web | Next.js 15 (App Router), Tailwind CSS 4, shadcn/ui |
| Mobile | React Native 0.76, Expo SDK 52, NativeWind v4 |
| Language | TypeScript 5.x |
| DB | PostgreSQL 16 (Neon), Prisma v6 |
| Auth | Auth.js v5 (Web), Firebase Auth (Mobile) |
| OCR | Tesseract.js (dual-pass 전처리) |
| State | Zustand (client), TanStack Query v5 (server) |
| Storage | AWS S3 + CloudFront |
| Deploy | Vercel (Web), EAS Build (Mobile) |

## 프로젝트 구조

```
cardkeeper/
├── apps/
│   ├── web/               # Next.js 15 웹 앱
│   └── mobile/            # React Native Expo 모바일 앱
├── packages/
│   ├── api-client/        # API 클라이언트 (Web/Mobile 공유)
│   ├── shared-types/      # TypeScript 타입 정의
│   ├── shared-utils/      # Zod 스키마, 포매터, 유효성 검증
│   ├── shared-constants/  # 상수, 제한값, 에러 코드
│   ├── eslint-config/     # ESLint 공유 설정
│   └── typescript-config/ # TSConfig 공유 설정
├── docs/                  # PRD, 구현 계획 문서
├── k6/                    # 부하 테스트 스크립트
├── Makefile               # 주요 명령어 모음
└── turbo.json             # Turborepo 파이프라인 설정
```

## 사전 요구 사항

- **Node.js** 20 (`.nvmrc` 참고)
- **pnpm** 9.15+
- **PostgreSQL** 16 (로컬 또는 [Neon](https://neon.tech))

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

```bash
cp apps/web/.env.example apps/web/.env
cp apps/mobile/.env.example apps/mobile/.env
```

`apps/web/.env`에 최소한 다음 값을 설정:

```
DATABASE_URL="postgresql://user:pass@localhost:5432/cardkeeper"
NEXTAUTH_SECRET="your-secret-key"
```

### 3. 데이터베이스 초기화

```bash
make db-generate    # Prisma 클라이언트 생성
make db-migrate     # 마이그레이션 실행
make db-seed        # (선택) 시드 데이터 투입
```

또는 한 번에:

```bash
make setup
```

### 4. 개발 서버 실행

```bash
make dev            # 전체 (Web + Mobile)
make dev-web        # 웹만 (http://localhost:3000)
make dev-mobile     # 모바일만 (Expo)
```

## 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `make install` | 전체 의존성 설치 |
| `make setup` | 초기 셋업 (install + db 생성 + 마이그레이션) |
| `make dev` | 전체 개발 서버 실행 |
| `make dev-web` | 웹 앱만 실행 |
| `make dev-mobile` | 모바일 앱만 실행 |
| `make build` | 프로덕션 빌드 |
| `make test` | 단위 테스트 (Vitest) |
| `make test-e2e` | E2E 테스트 (Playwright / Detox) |
| `make lint` | ESLint 실행 |
| `make type-check` | TypeScript 타입 검사 |
| `make format` | Prettier 포매팅 |
| `make check` | lint + type-check + format-check (CI 동일) |
| `make db-studio` | Prisma Studio (DB GUI) |
| `make clean` | 빌드 캐시 및 node_modules 정리 |

## 핵심 기능

- **명함 수동 입력** — 이름, 회사, 직함, 연락처(전화/이메일/SNS) 등록
- **OCR 스캔** — 카메라 촬영 또는 이미지 업로드로 명함 자동 인식
- **폴더 & 태그** — 명함을 폴더로 분류하고 태그로 라벨링
- **검색 & 필터** — Full-text Search, 폴더/태그/즐겨찾기 필터
- **내보내기** — vCard, CSV 형식으로 명함 데이터 내보내기
- **다국어 지원** — 한국어, 영어, 일본어 (next-intl)
- **다크 모드** — 시스템 설정 연동 light/dark 테마

## 테스트

```bash
make test           # Vitest 단위 테스트
make test-e2e       # Playwright E2E (Web) / Detox (Mobile)
make test-load      # k6 부하 테스트
```

## 문서

구현 계획 문서는 `docs/plan/` 디렉토리에 있습니다:

| 문서 | 내용 |
|------|------|
| `00-overview.md` | 구현 계획 총괄 |
| `01-project-setup.md` | 프로젝트 셋업 & 인프라 |
| `02-backend-api.md` | 백엔드 API & 핵심 기능 |
| `03-frontend-web.md` | 웹 프론트엔드 |
| `04-frontend-mobile.md` | 모바일 프론트엔드 |
| `05-state-management.md` | 상태관리 & 데이터 패칭 |
| `06-shared-packages.md` | 공유 패키지 상세 |
| `07-database-schema.md` | DB 스키마 & 마이그레이션 |
| `08-testing-strategy.md` | 테스트 전략 |
| `09-implementation-sequence.md` | 구현 순서 & 의존관계 |

## 라이선스

Private
