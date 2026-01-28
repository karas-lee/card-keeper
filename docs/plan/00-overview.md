# CardKeeper 구현 계획 총괄

**문서 버전:** v1.0
**작성일:** 2026-01-27
**기반 문서:** PRD_명함관리_웹앱.md v1.0

---

## 1. 문서 구조 안내

| # | 파일명 | 내용 |
|---|--------|------|
| 00 | `00-overview.md` | 구현 계획 총괄 (본 문서) |
| 01 | `01-project-setup.md` | 프로젝트 셋업 & 인프라 |
| 02 | `02-backend-api.md` | 백엔드 API & 핵심 기능 |
| 03 | `03-frontend-web.md` | 웹 프론트엔드 (Next.js 15) |
| 04 | `04-frontend-mobile.md` | 모바일 프론트엔드 (React Native Expo) |
| 05 | `05-state-management.md` | 상태관리 & 데이터 패칭 |
| 06 | `06-shared-packages.md` | 공유 패키지 상세 |
| 07 | `07-database-schema.md` | 데이터베이스 스키마 & 마이그레이션 |
| 08 | `08-testing-strategy.md` | 테스트 전략 |
| 09 | `09-implementation-sequence.md` | 구현 순서 & 의존관계 |

---

## 2. 기술 스택 요약

### 프론트엔드

| 영역 | 기술 | 버전 |
|------|------|------|
| Web Framework | Next.js (App Router) | 15 |
| Mobile Framework | React Native + Expo | RN 0.76+ / Expo SDK 52+ |
| Language | TypeScript | 5.x |
| Web Styling | Tailwind CSS + shadcn/ui | Tailwind 4 |
| Mobile Styling | NativeWind | v4 |
| Client State | Zustand | latest |
| Server State | TanStack Query | v5 |
| Form | React Hook Form + Zod | latest |
| Web i18n | next-intl | latest |
| Mobile Router | Expo Router | latest |
| Mobile Storage | MMKV | latest |

### 백엔드

| 영역 | 기술 | 버전/비고 |
|------|------|-----------|
| API Server | Next.js API Routes | Serverless (Vercel) |
| ORM | Prisma | v6+ |
| Database | PostgreSQL (Neon) | 16, Serverless Auto-scaling |
| OCR | Tesseract.js | Worker Pool + Dual-pass 전처리 |
| Image Storage | AWS S3 + CloudFront | CDN 배포 |
| Web Auth | Auth.js | v5 (NextAuth) |
| Mobile Auth | Firebase Auth | latest |
| Validation | Zod | latest |
| Image Processing | Sharp | latest |
| Password Hashing | bcrypt | cost 12 |
| JWT | jose | latest |

### DevOps

| 영역 | 기술 |
|------|------|
| Monorepo | Turborepo + pnpm workspace |
| Web Deploy | Vercel (자동 CI/CD) |
| Mobile Build | EAS Build / EAS Update |
| CI/CD | GitHub Actions |
| Version Control | Git + GitHub |

---

## 3. 전체 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                        Clients                                   │
│                                                                  │
│  ┌──────────────────────┐     ┌───────────────────────────────┐ │
│  │   Web App (Next.js 15)│     │  Mobile App (Expo SDK 52+)    │ │
│  │   - App Router        │     │  - Expo Router                │ │
│  │   - Tailwind CSS 4    │     │  - NativeWind v4              │ │
│  │   - shadcn/ui         │     │  - Expo Camera                │ │
│  │   - Auth.js v5        │     │  - Firebase Auth              │ │
│  │   - Zustand           │     │  - Zustand                    │ │
│  │   - TanStack Query v5 │     │  - TanStack Query v5          │ │
│  │   - React Hook Form   │     │  - React Hook Form            │ │
│  └──────────┬───────────┘     └──────────────┬────────────────┘ │
└─────────────┼────────────────────────────────┼──────────────────┘
              │         HTTPS / REST API       │
              │      (Bearer JWT Token)        │
              ▼                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                Shared Packages (Turborepo)                        │
│   ┌──────────────┐ ┌────────────┐ ┌─────────────────┐           │
│   │ shared-types  │ │shared-utils│ │shared-constants │           │
│   └──────────────┘ └────────────┘ └─────────────────┘           │
│   ┌──────────────┐                                               │
│   │  api-client   │                                               │
│   └──────┬───────┘                                               │
└──────────┼───────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│              Backend API Layer (Vercel Serverless)                │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Next.js API Routes (/api/v1/*)                  │ │
│  │                                                              │ │
│  │  Auth │ Cards │ Folders │ Tags │ Scan │ Export               │ │
│  │                                                              │ │
│  │  Middleware: JWT Verify │ Zod Validate │ Rate Limit │ CORS  │ │
│  └─────────────────────────┬───────────────────────────────────┘ │
│                             │                                     │
│  ┌──────────────────────────┼──────────────────────────────────┐ │
│  │              Service Layer                                   │ │
│  │  AuthService │ CardService │ FolderService │ TagService      │ │
│  │  ScanService │ ExportService │ ImageService                  │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
│                             │                                     │
│                      Prisma ORM v6+                               │
└─────────────────────────────┬────────────────────────────────────┘
                              │
┌─────────────────────────────┼────────────────────────────────────┐
│                    External Services                              │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ PostgreSQL 16 │  │ AWS S3       │  │ Google Cloud Vision    │ │
│  │ (Neon)        │  │ + CloudFront │  │ (OCR Engine)           │ │
│  │ - FTS tsvector│  │ (이미지 CDN) │  │ - TEXT_DETECTION       │ │
│  └──────────────┘  └──────────────┘  │ - DOCUMENT_TEXT_DETECT. │ │
│                                       └────────────────────────┘ │
│  ┌──────────────┐  ┌──────────────┐                              │
│  │ Auth.js v5    │  │ Firebase Auth│                              │
│  │ (Web 인증)    │  │ (Mobile 인증)│                              │
│  └──────────────┘  └──────────────┘                              │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. 마일스톤 일정

### Phase 1: MVP (8주)

| 주차 | 마일스톤 | 주요 산출물 | 관련 문서 |
|------|----------|------------|-----------|
| **1-2** | 프로젝트 셋업 | Monorepo, Next.js/Expo 초기화, Prisma Schema, CI/CD, 디자인 시스템 | 01, 07 |
| **3-4** | 인증 + 핵심 CRUD | Auth.js/Firebase Auth 구축, 명함 수동입력/조회/수정/삭제 | 02, 03, 04 |
| **5-6** | OCR + 정리 기능 | Google Vision 연동, S3 업로드, OCR 파싱, 폴더/태그/즐겨찾기 | 02, 03, 04 |
| **7-8** | 검색 + 내보내기 + QA | Full-text Search, 필터/정렬, vCard/CSV 내보내기, E2E, 배포 | 02, 03, 04, 08 |

### MVP 완료 기준 (Definition of Done)

- 모든 P0 기능 완성 + P1 기능 80% 이상 완성
- 핵심 사용자 흐름 E2E 테스트 통과
- Lighthouse Performance Score ≥ 80 (Web)
- Crash-free Rate ≥ 99% (Mobile)
- OWASP Top 10 보안 감사 완료

### Phase 2: 고도화 (6주)

| 주차 | 마일스톤 | 주요 작업 |
|------|----------|----------|
| 9-10 | AI 기능 | 중복 감지(Fuzzy Matching), 스마트 분류 |
| 11-12 | 메모 + 디지털 공유 | 연락처별 메모, 디지털 명함, QR 코드 공유 |
| 13-14 | 안정화 | 성능 최적화, 오프라인 캐시, Push Notification |

### Phase 3: 확장 (8주)

| 주차 | 마일스톤 | 주요 작업 |
|------|----------|----------|
| 15-18 | 외부 연동 | Calendar, SNS 프로필, 분석 대시보드, Stripe |
| 19-22 | B2B 확장 | 팀 워크스페이스, 관리자 대시보드, 기업 라이선스 |

---

## 5. 핵심 설계 원칙

1. **코드 공유 극대화:** Turborepo 모노레포로 타입, 유틸, 상수, API 클라이언트를 Web/Mobile 간 공유
2. **API-First:** 백엔드 API를 먼저 설계/구현하고, 프론트엔드가 동일한 api-client 패키지를 통해 소비
3. **Type-Safe End-to-End:** Prisma → Zod → TypeScript → API Client까지 타입 일관성 보장
4. **Offline-Ready 설계:** 모바일 MMKV + TanStack Query 캐시를 통한 오프라인 지원 고려
5. **점진적 배포:** Vercel Preview Deploy + EAS Update로 피처 브랜치별 프리뷰 환경 제공

---

## 6. PRD 섹션 매핑

각 구현 계획 문서가 PRD의 12개 섹션을 어떻게 커버하는지:

| PRD 섹션 | 관련 구현 계획 문서 |
|----------|-------------------|
| §1. 제품 개요 | 00 (본 문서) |
| §2. 사용자 페르소나 | 00, 09 (우선순위 결정에 반영) |
| §3. 핵심 기능 - MVP | 02, 03, 04, 05 |
| §4. Post-MVP 기능 | 09 (Phase 2/3 계획) |
| §5. 정보 구조 | 03, 04 |
| §6. 기술 아키텍처 | 01, 02, 05, 06 |
| §7. 데이터 모델 | 07 |
| §8. API 설계 | 02, 06 |
| §9. 비기능적 요구사항 | 02 (보안/성능), 08 (테스트) |
| §10. 성공 지표 | 09 (검증 체크리스트) |
| §11. 개발 단계 | 09 |
| §12. 리스크 평가 | 09 (리스크 완화 전략 포함) |
| 부록 A. 요금제 | 02 (제한값 상수) |
| 부록 B. 디렉토리 구조 | 01, 03, 04 |

---

**다음 문서:** [01-project-setup.md](./01-project-setup.md)
