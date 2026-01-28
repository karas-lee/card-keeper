# 09. 구현 순서 & 의존관계

---

## 1. Week 1-2: 프로젝트 셋업

### Day 1-2: 모노레포 기초

| # | 작업 | 산출물 | 의존 |
|---|------|--------|------|
| 1.1 | Turborepo + pnpm workspace 초기화 | `turbo.json`, `pnpm-workspace.yaml`, 루트 `package.json` | - |
| 1.2 | 공유 설정 패키지 생성 | `packages/typescript-config/`, `packages/eslint-config/` | 1.1 |
| 1.3 | `.gitignore`, `.prettierrc`, `.nvmrc` 설정 | 루트 설정 파일들 | 1.1 |
| 1.4 | GitHub 리포지토리 생성 + 초기 커밋 | 원격 저장소 | 1.1-1.3 |

### Day 3-4: 공유 패키지 & 앱 초기화

| # | 작업 | 산출물 | 의존 |
|---|------|--------|------|
| 1.5 | `shared-types` 패키지: Entity/API/Enum 타입 정의 | 전체 TypeScript 타입 | 1.2 |
| 1.6 | `shared-constants` 패키지: 에러코드, 제한값, 설정값 | 상수 파일들 | 1.2 |
| 1.7 | `shared-utils` 패키지: Zod 스키마 전체 + 포맷터 + 밸리데이터 | 검증 로직 | 1.5, 1.6 |
| 1.8 | Next.js 15 웹앱 초기화 (App Router, Tailwind 4, PostCSS) | `apps/web/` 기본 구조 | 1.2 |
| 1.9 | React Native Expo 모바일앱 초기화 (Expo SDK 52+, Expo Router) | `apps/mobile/` 기본 구조 | 1.2 |

### Day 5-6: 데이터베이스 & 인프라

| # | 작업 | 산출물 | 의존 |
|---|------|--------|------|
| 1.10 | Neon PostgreSQL 프로젝트 생성 (Dev/Staging/Prod) | DB 인스턴스 | - |
| 1.11 | Prisma Schema 전체 작성 (모든 모델) | `prisma/schema.prisma` | 1.8, 1.10 |
| 1.12 | 초기 마이그레이션 실행 | `prisma/migrations/` | 1.11 |
| 1.13 | Full-Text Search 마이그레이션 (tsvector, GIN, 트리거) | SQL 마이그레이션 | 1.12 |
| 1.14 | Seed 스크립트 작성 | `prisma/seed.ts` | 1.12 |
| 1.15 | AWS S3 버킷 + CloudFront 설정 | S3 버킷, CDN | - |

### Day 7-8: CI/CD & 디자인 시스템

| # | 작업 | 산출물 | 의존 |
|---|------|--------|------|
| 1.16 | GitHub Actions CI 워크플로 (lint, type-check, test) | `.github/workflows/ci.yml` | 1.4 |
| 1.17 | Vercel 프로젝트 연결 + 환경 변수 설정 | Vercel 배포 | 1.8 |
| 1.18 | 환경 변수 파일 정리 (`.env.local`, `.env.example`) | 환경 변수 | 1.10, 1.15 |
| 1.19 | shadcn/ui 초기 설정 + 핵심 컴포넌트 추가 | UI 컴포넌트 기초 | 1.8 |
| 1.20 | NativeWind v4 설정 (모바일) | 모바일 스타일링 | 1.9 |
| 1.21 | 웹 레이아웃 기초 (Root/Auth/Main 레이아웃) | 레이아웃 컴포넌트 | 1.19 |
| 1.22 | 모바일 네비게이션 기초 (Tab Navigator) | 탭 구조 | 1.20 |
| 1.23 | 프로바이더 구조 (QueryClient, Theme, i18n) | Providers 래퍼 | 1.8, 1.9 |
| 1.24 | `api-client` 패키지: HttpClient + 엔드포인트 함수 | API 클라이언트 | 1.5, 1.7 |

### Week 1-2 완료 기준

- [x] `pnpm dev`로 웹앱/모바일앱 동시 실행
- [x] Prisma Studio에서 DB 스키마 확인
- [x] GitHub Actions CI 성공
- [x] Vercel Preview 배포 성공
- [x] 공유 패키지 4종 + 설정 패키지 2종 빌드 성공

---

## 2. Week 3-4: 인증 + 핵심 CRUD

### Day 9-10: 인증 백엔드

| # | 작업 | 산출물 | 의존 |
|---|------|--------|------|
| 2.1 | Prisma Client 싱글턴 (`lib/db.ts`) | DB 연결 | 1.12 |
| 2.2 | JWT 유틸리티 (`lib/auth/jwt.ts`) - jose | 토큰 생성/검증 | - |
| 2.3 | 비밀번호 유틸리티 (`lib/auth/password.ts`) - bcrypt | 해싱/검증 | - |
| 2.4 | API 응답 헬퍼 + 에러 핸들링 (`lib/utils/`) | 표준 응답 | 1.6 |
| 2.5 | Zod 검증 미들웨어 (`lib/middleware/validate.ts`) | 검증 미들웨어 | 1.7 |
| 2.6 | 인증 미들웨어 (`lib/middleware/auth.ts`) | 인증 미들웨어 | 2.2 |
| 2.7 | 회원가입 API (`POST /auth/register`) | API Route | 2.1-2.6 |
| 2.8 | 로그인 API (`POST /auth/login`) + LoginAttempt 기록 | API Route | 2.7 |
| 2.9 | 토큰 갱신 API (`POST /auth/refresh`) | API Route | 2.2 |
| 2.10 | 로그아웃 API (`POST /auth/logout`) | API Route | 2.6 |
| 2.11 | 현재 사용자 API (`GET /auth/me`) | API Route | 2.6 |

### Day 11-12: 인증 프론트엔드

| # | 작업 | 산출물 | 의존 |
|---|------|--------|------|
| 2.12 | Zustand authStore 구현 | 인증 상태 관리 | 1.24 |
| 2.13 | 웹 로그인 페이지 + 폼 | `(auth)/login/page.tsx` | 2.8, 2.12 |
| 2.14 | 웹 회원가입 페이지 + 폼 | `(auth)/register/page.tsx` | 2.7, 2.12 |
| 2.15 | 웹 Auth 라우트 가드 (미인증 리디렉트) | middleware.ts | 2.12 |
| 2.16 | 모바일 Firebase Auth 초기화 | Firebase 설정 | - |
| 2.17 | 모바일 로그인/회원가입 화면 | 모바일 인증 화면 | 2.12, 2.16 |
| 2.18 | Firebase 토큰 검증 미들웨어 (`firebase-admin.ts`) | 모바일 인증 | 2.6 |

### Day 13-14: Auth.js + OAuth

| # | 작업 | 산출물 | 의존 |
|---|------|--------|------|
| 2.19 | Auth.js v5 설정 (Credentials Provider) | `auth.config.ts`, `auth.ts` | 2.7, 2.8 |
| 2.20 | Google OAuth Provider | OAuth 로그인 | 2.19 |
| 2.21 | Apple Sign-In Provider | OAuth 로그인 | 2.19 |
| 2.22 | Kakao Login Provider | OAuth 로그인 | 2.19 |
| 2.23 | 소셜 로그인 버튼 (웹 + 모바일) | UI 컴포넌트 | 2.20-2.22 |
| 2.24 | 비밀번호 재설정 API + 페이지 | 비밀번호 재설정 흐름 | 2.7 |
| 2.25 | 이메일 인증 API + 페이지 | 이메일 인증 흐름 | 2.7 |
| 2.26 | 인증 단위 테스트 | JWT, 비밀번호, 미들웨어 테스트 | 2.2-2.6 |
| 2.27 | 인증 통합 테스트 | API Route 테스트 | 2.7-2.11 |

### Day 15-16: 명함 CRUD 백엔드

| # | 작업 | 산출물 | 의존 |
|---|------|--------|------|
| 2.28 | 커서 기반 페이지네이션 유틸 (`lib/utils/pagination.ts`) | 페이지네이션 | 2.1 |
| 2.29 | 명함 서비스 (`lib/services/card.service.ts`) | 비즈니스 로직 | 2.1, 2.28 |
| 2.30 | `POST /api/v1/cards` - 명함 생성 | API Route | 2.29 |
| 2.31 | `GET /api/v1/cards` - 목록 조회 (기본 필터/정렬/페이징) | API Route | 2.29 |
| 2.32 | `GET /api/v1/cards/:id` - 상세 조회 | API Route | 2.29 |
| 2.33 | `PUT /api/v1/cards/:id` - 수정 | API Route | 2.29 |
| 2.34 | `DELETE /api/v1/cards/:id` - 삭제 | API Route | 2.29 |
| 2.35 | `PATCH /api/v1/cards/:id/favorite` - 즐겨찾기 | API Route | 2.29 |
| 2.36 | 명함 CRUD 통합 테스트 | API 테스트 | 2.30-2.35 |

### Day 17-18: 명함 CRUD 프론트엔드

| # | 작업 | 산출물 | 의존 |
|---|------|--------|------|
| 2.37 | Zustand uiStore + TanStack Query 설정 | 상태 관리 기초 | 1.23 |
| 2.38 | Query Key 팩토리 구현 | `query-keys.ts` | 1.24 |
| 2.39 | 웹 명함 목록 페이지 (카드/리스트 뷰) | cards/page.tsx | 2.31, 2.37 |
| 2.40 | 웹 무한 스크롤 (useInfiniteQuery) | 무한 스크롤 | 2.39 |
| 2.41 | 웹 수동 입력 폼 (RHF + Zod + 다중값 연락처) | cards/new/page.tsx | 2.30 |
| 2.42 | 웹 명함 상세 (Split View) | cards/[id]/page.tsx | 2.32 |
| 2.43 | 웹 즐겨찾기 Optimistic Update | 즐겨찾기 토글 | 2.35 |
| 2.44 | 모바일 명함 목록 (FlatList) | (tabs)/index.tsx | 2.31 |
| 2.45 | 모바일 명함 상세 | card/[id].tsx | 2.32 |
| 2.46 | 모바일 수동 입력 | card/new.tsx | 2.30 |
| 2.47 | Draft 자동저장 (draftStore) | Draft 기능 | 2.41, 2.46 |

### Week 3-4 완료 기준

- [x] 이메일/비밀번호 로그인/회원가입 동작
- [x] Google/Apple/Kakao 소셜 로그인 동작
- [x] 명함 수동 입력 → 목록 표시 → 상세 → 편집 → 삭제 전체 흐름
- [x] 즐겨찾기 토글 (Optimistic Update)
- [x] 웹 + 모바일 양 플랫폼 동작

---

## 3. Week 5-6: OCR + 정리 기능

### Day 19-20: S3 이미지 처리 + OCR

| # | 작업 | 산출물 | 의존 |
|---|------|--------|------|
| 3.1 | S3 클라이언트 (`lib/storage/s3-client.ts`) | S3 연결 | 1.15 |
| 3.2 | 이미지 처리 서비스 (Sharp 리사이즈/HEIC 변환/썸네일) | `image.service.ts` | - |
| 3.3 | Tesseract.js OCR 클라이언트 (Worker Pool + Dual-pass 전처리) | `ocr/vision-client.ts` | - |
| 3.4 | OCR 텍스트 파서 (정규식 + 휴리스틱) | `ocr/text-parser.ts` | - |
| 3.5 | 스캔 서비스 (업로드 → S3 → OCR → 파싱) | `scan.service.ts` | 3.1-3.4 |
| 3.6 | `POST /api/v1/scan/upload` API | OCR 업로드 | 3.5 |
| 3.7 | `POST /api/v1/scan/confirm` API | OCR 확인 저장 | 3.5, 2.29 |
| 3.8 | OCR 파서 단위 테스트 | 파싱 테스트 | 3.4 |

### Day 21-22: 스캔 프론트엔드

| # | 작업 | 산출물 | 의존 |
|---|------|--------|------|
| 3.9 | 웹 파일 업로드 (드래그앤드롭) | scan/page.tsx | 3.6 |
| 3.10 | 웹 WebRTC 카메라 캡처 | camera-capture.tsx | 3.6 |
| 3.11 | 웹 OCR 결과 확인/편집 폼 | scan/confirm/page.tsx | 3.7 |
| 3.12 | 모바일 카메라 뷰파인더 (Expo Camera) | (tabs)/scan.tsx | 3.6 |
| 3.13 | 모바일 프레임 가이드 + 촬영 버튼 | CameraViewfinder, CaptureButton | 3.12 |
| 3.14 | 모바일 갤러리 선택 (expo-image-picker) | 이미지 선택 | 3.6 |
| 3.15 | 모바일 OCR 결과 확인/편집 | scan/confirm.tsx | 3.7 |

### Day 23-24: 폴더 관리

| # | 작업 | 산출물 | 의존 |
|---|------|--------|------|
| 3.16 | 폴더 서비스 (`folder.service.ts`) | 비즈니스 로직 | 2.1 |
| 3.17 | 폴더 CRUD API (GET/POST/PUT/DELETE) | API Routes | 3.16 |
| 3.18 | `PATCH /api/v1/cards/:id/folder` 폴더 이동 API | API Route | 2.29 |
| 3.19 | 일괄 폴더 이동 API (`POST /batch/move`) | API Route | 2.29 |
| 3.20 | 웹 폴더 관리 (트리뷰 + CRUD) | folders/page.tsx | 3.17 |
| 3.21 | 웹 폴더 선택 모달 (이동용) | folder-select-modal.tsx | 3.17 |
| 3.22 | 웹 사이드바에 폴더 트리 표시 | sidebar.tsx 업데이트 | 3.17 |
| 3.23 | 모바일 폴더 목록 + CRUD | (tabs)/folders.tsx | 3.17 |
| 3.24 | 모바일 폴더별 명함 목록 | folder/[id].tsx | 3.17, 2.31 |

### Day 25-26: 태그 관리 + 즐겨찾기

| # | 작업 | 산출물 | 의존 |
|---|------|--------|------|
| 3.25 | 태그 서비스 (`tag.service.ts`) | 비즈니스 로직 | 2.1 |
| 3.26 | 태그 CRUD API (GET/POST/PUT/DELETE) | API Routes | 3.25 |
| 3.27 | 명함 태그 추가/제거 API | API Routes | 2.29 |
| 3.28 | 일괄 태그 API (`POST /batch/tag`) | API Route | 2.29 |
| 3.29 | 웹 태그 관리 (CRUD + 컬러피커) | tags/page.tsx | 3.26 |
| 3.30 | 웹 태그 선택 모달 | tag-select-modal.tsx | 3.26 |
| 3.31 | 웹 명함 목록 필터에 폴더/태그/즐겨찾기 추가 | card-filter-bar.tsx | 3.17, 3.26 |
| 3.32 | 웹 다중 선택 + 일괄 작업 (이동/태그/삭제) | card-selection-bar.tsx | 3.19, 3.28 |
| 3.33 | 모바일 태그 관리 | tags/manage.tsx | 3.26 |
| 3.34 | 모바일 Long Press 다중 선택 | 다중 선택 모드 | 3.19, 3.28 |
| 3.35 | 일괄 삭제 API + Optimistic Update | batch delete | 2.29 |

### Week 5-6 완료 기준

- [x] 이미지 업로드 → OCR → 결과 확인 → 저장 전체 파이프라인
- [x] 모바일 카메라 촬영 → OCR 동작
- [x] 폴더 CRUD + 트리 구조 + 명함 이동
- [x] 태그 CRUD + 명함 태그 추가/제거
- [x] 즐겨찾기 + 필터/정렬
- [x] 다중 선택 + 일괄 작업 (이동/태그/삭제)

---

## 4. Week 7-8: 검색 + 내보내기 + QA

### Day 27-28: 검색 & 필터 고도화

| # | 작업 | 산출물 | 의존 |
|---|------|--------|------|
| 4.1 | Full-Text Search 구현 (`lib/utils/search.ts`) | 검색 엔진 | 1.13 |
| 4.2 | 카드 목록 API에 FTS 통합 | 검색 기능 | 4.1 |
| 4.3 | 웹 검색바 (Debounce 300ms + 최근 검색어) | card-search-bar.tsx | 4.2 |
| 4.4 | 웹 뷰 토글 (카드/리스트/테이블) | 뷰 모드 전환 | 2.39 |
| 4.5 | 웹 테이블 뷰 구현 | card-table-view.tsx | 4.4 |
| 4.6 | 모바일 검색 + 필터 | 검색 기능 | 4.2 |
| 4.7 | Rate Limiting 미들웨어 | `rate-limit.ts` | - |

### Day 29-30: 내보내기

| # | 작업 | 산출물 | 의존 |
|---|------|--------|------|
| 4.8 | 내보내기 서비스 (vCard 3.0/4.0 생성) | `export.service.ts` | 2.29 |
| 4.9 | 내보내기 서비스 (CSV UTF-8 BOM) | `export.service.ts` | 2.29 |
| 4.10 | `POST /api/v1/export/vcard` API | API Route | 4.8 |
| 4.11 | `POST /api/v1/export/csv` API | API Route | 4.9 |
| 4.12 | 웹 내보내기 위자드 (범위/형식 선택 → 다운로드) | settings/export/page.tsx | 4.10, 4.11 |
| 4.13 | 모바일 내보내기 | settings/export.tsx | 4.10, 4.11 |
| 4.14 | 내보내기 단위/통합 테스트 | 테스트 | 4.8, 4.9 |

### Day 31-32: 설정 & 나머지 기능

| # | 작업 | 산출물 | 의존 |
|---|------|--------|------|
| 4.15 | 웹 설정 페이지 (프로필 편집, 도움말) | settings/*.tsx | 2.11 |
| 4.16 | 웹 온보딩 페이지 | onboarding/page.tsx | - |
| 4.17 | 모바일 설정 화면 | settings.tsx, settings/*.tsx | 2.11 |
| 4.18 | 모바일 온보딩 슬라이드 | (auth)/onboarding.tsx | - |
| 4.19 | 웹 명함 상세 빠른 액션 (전화/이메일/지도/웹) | card-quick-actions.tsx | 2.42 |
| 4.20 | 웹 명함 인라인 편집 | card-detail.tsx | 2.33 |
| 4.21 | 모바일 Swipe 액션 (삭제/즐겨찾기) | CardItem Swipeable | 2.34, 2.35 |
| 4.22 | 모바일 Deep Linking 설정 | app.json + Expo Router | - |

### Day 33-34: 테스트 & QA

| # | 작업 | 산출물 | 의존 |
|---|------|--------|------|
| 4.23 | 단위 테스트 보완 (커버리지 80% 달성) | 테스트 코드 | 전체 |
| 4.24 | 통합 테스트 전체 API 커버 | 테스트 코드 | 전체 |
| 4.25 | E2E 테스트 핵심 흐름 작성 (Playwright) | E2E 테스트 | 전체 |
| 4.26 | OWASP Top 10 보안 체크리스트 점검 | 보안 검증 | 전체 |
| 4.27 | Lighthouse 성능 점검 (Score ≥ 80) | 성능 최적화 | 전체 |
| 4.28 | WCAG 2.1 AA 접근성 점검 | 접근성 수정 | 전체 |

### Day 35-36: 배포 & 안정화

| # | 작업 | 산출물 | 의존 |
|---|------|--------|------|
| 4.29 | Staging 환경 배포 + 전체 QA | Staging 배포 | 전체 |
| 4.30 | Production 배포 | Production 배포 | 4.29 |
| 4.31 | EAS Build (iOS + Android) | 모바일 빌드 | 전체 |
| 4.32 | 부하 테스트 (k6) 실행 | 성능 보고서 | 4.30 |
| 4.33 | 모니터링 설정 (Vercel Analytics) | 모니터링 | 4.30 |

### Week 7-8 완료 기준

- [x] Full-Text Search 10,000건 500ms 이내
- [x] vCard/CSV 내보내기 동작 (1,000건 5초 이내)
- [x] 핵심 흐름 E2E 테스트 통과
- [x] 단위 테스트 커버리지 80%+
- [x] Lighthouse ≥ 80
- [x] OWASP 보안 감사 통과
- [x] Production 배포 완료

---

## 5. 핵심 의존관계 다이어그램

```
Week 1-2: Setup
┌──────────────┐
│ 1.1 Monorepo │
│    초기화     │
└──────┬───────┘
       │
┌──────▼───────┐     ┌────────────────┐
│ 1.2 TypeScript│     │ 1.10 Neon DB   │
│ /ESLint 설정  │     │   생성          │
└──┬───────┬───┘     └───────┬────────┘
   │       │                 │
┌──▼──┐ ┌──▼────────┐ ┌─────▼────────┐
│1.5-7│ │1.8 Next.js │ │1.11 Prisma   │
│공유  │ │1.9 Expo    │ │  Schema      │
│패키지│ └──┬────────┘ └──┬───────────┘
└──┬──┘    │              │
   │    ┌──▼──────────────▼──┐
   │    │ 1.12-14 Migration  │
   │    │   + Seed           │
   │    └────────┬───────────┘
   │             │
┌──▼─────────────▼──┐
│ 1.19-24 UI 기초   │
│ + API Client      │
└────────┬──────────┘
         │
Week 3-4: Auth + CRUD
┌────────▼──────────┐
│ 2.1-6 백엔드 기초  │
│ (DB, JWT, MW)     │
└────────┬──────────┘
         │
┌────────▼──────────┐
│ 2.7-11 인증 API   │
└──┬────────────┬───┘
   │            │
┌──▼────────┐ ┌▼────────────┐
│ 2.12-18   │ │ 2.29-36     │
│ 인증 FE   │ │ 명함 CRUD   │
└───────────┘ │ 백엔드       │
              └──┬───────────┘
                 │
         ┌───────▼───────┐
         │ 2.37-47       │
         │ 명함 CRUD FE  │
         └───────┬───────┘
                 │
Week 5-6: OCR + 정리
┌────────────────▼──────────────────┐
│                                    │
│  ┌──────────┐  ┌──────┐  ┌─────┐ │
│  │ 3.1-8    │  │3.16-24│ │3.25-│ │
│  │ OCR      │  │폴더   │ │3.35 │ │
│  │ Pipeline │  │관리   │ │태그  │ │
│  └────┬─────┘  └───┬──┘ └──┬──┘ │
│       │            │       │     │
│  ┌────▼─────┐ ┌────▼────┐ │     │
│  │3.9-15    │ │3.20-24  │ │     │
│  │스캔 FE   │ │폴더 FE  │ │     │
│  └──────────┘ └─────────┘ │     │
└────────────────────────────┼─────┘
                             │
Week 7-8: Search + Export + QA
┌────────────────────────────▼─────┐
│  ┌──────────┐  ┌──────────────┐  │
│  │ 4.1-7    │  │ 4.8-14       │  │
│  │ 검색/필터 │  │ 내보내기     │  │
│  └────┬─────┘  └──────┬───────┘  │
│       │               │          │
│  ┌────▼───────────────▼───────┐  │
│  │ 4.15-22 설정/온보딩/나머지  │  │
│  └────────────┬───────────────┘  │
│               │                  │
│  ┌────────────▼───────────────┐  │
│  │ 4.23-28 테스트/QA/보안     │  │
│  └────────────┬───────────────┘  │
│               │                  │
│  ┌────────────▼───────────────┐  │
│  │ 4.29-33 배포/모니터링      │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

---

## 6. 환경 변수 전체 목록

```bash
# ──── Database ────
DATABASE_URL=                          # Neon PostgreSQL (pooled)
DIRECT_DATABASE_URL=                   # Neon PostgreSQL (direct, migration용)

# ──── Auth.js ────
NEXTAUTH_URL=                          # http://localhost:3000 (dev)
NEXTAUTH_SECRET=                       # openssl rand -base64 32

# ──── OAuth Providers ────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=

# ──── Firebase (모바일 토큰 검증) ────
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# ──── AWS S3 ────
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_CLOUDFRONT_URL=

# ──── App (Public) ────
NEXT_PUBLIC_APP_URL=                   # http://localhost:3000
NEXT_PUBLIC_CDN_URL=                   # CloudFront URL

# ──── Mobile ────
EXPO_PUBLIC_API_URL=                   # http://localhost:3000/api/v1
EXPO_PUBLIC_CDN_URL=
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

---

## 7. 리스크 완화 전략

| 리스크 | 구현 단계 | 완화 전략 |
|--------|----------|----------|
| OCR 정확도 미달 | Week 5-6 | Tesseract.js Dual-pass 전처리 (일반/반전), PSM SPARSE_TEXT, DPI 300, rotateAuto 적용, 수정 UI를 핵심 UX로 설계 |
| 인증 통합 복잡도 | Week 3-4 | Auth.js + Firebase 통합 미들웨어를 먼저 설계/테스트 |
| Cross-Platform 코드 공유율 | Week 1-2 | 공유 패키지를 초기에 확실히 설계, 비즈니스 로직은 반드시 공유 |
| Serverless Cold Start | Week 7-8 | Edge Functions 적용, Connection Pooling (Neon) |
| 이미지 처리 병목 | Week 5-6 | 클라이언트 전처리 + S3 직접 업로드(Presigned URL) + 비동기 처리 |

---

## 8. MVP 검증 체크리스트

### 기능 완성도 (PRD 매핑)

| PRD 기능 | 우선순위 | 구현 여부 |
|----------|---------|----------|
| 사용자 인증 (이메일/소셜) | P0 | Week 3-4 |
| 명함 스캔 - OCR | P0 | Week 5-6 |
| 수동 명함 입력 | P0 | Week 3-4 |
| 명함 정리 (폴더/태그/즐겨찾기) | P0 | Week 5-6 |
| 검색 및 필터 | P1 | Week 7-8 |
| 연락처 상세 보기 | P1 | Week 3-4 |
| 연락처 내보내기 | P1 | Week 7-8 |

### 비기능적 요구사항

| 항목 | 목표 | 검증 방법 |
|------|------|----------|
| Web LCP | ≤ 2.5s | Lighthouse |
| API P95 | < 500ms | k6 부하 테스트 |
| 검색 10,000건 | < 500ms | 통합 테스트 |
| 단위 테스트 커버리지 | ≥ 80% | Vitest coverage |
| E2E 핵심 흐름 | 100% | Playwright |
| 보안 | OWASP Top 10 | 수동 체크리스트 |
| 접근성 | WCAG 2.1 AA | axe-core |

---

**이전 문서:** [08-testing-strategy.md](./08-testing-strategy.md)
**처음으로:** [00-overview.md](./00-overview.md)
