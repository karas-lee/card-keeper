# 명함 관리 웹/앱 서비스 - 제품 요구사항 정의서 (PRD)

**문서 버전:** v1.0
**작성일:** 2026년 1월 27일
**문서 상태:** 초안 (Draft)

---

## 목차

1. [제품 개요](#1-제품-개요)
2. [사용자 페르소나](#2-사용자-페르소나)
3. [핵심 기능 - MVP](#3-핵심-기능---mvp)
4. [Post-MVP 기능](#4-post-mvp-기능)
5. [정보 구조](#5-정보-구조)
6. [기술 아키텍처](#6-기술-아키텍처)
7. [데이터 모델](#7-데이터-모델)
8. [API 설계](#8-api-설계)
9. [비기능적 요구사항](#9-비기능적-요구사항)
10. [성공 지표 (KPIs)](#10-성공-지표)
11. [개발 단계 및 마일스톤](#11-개발-단계-및-마일스톤)
12. [리스크 평가](#12-리스크-평가)

---

## 1. 제품 개요

### 1.1 비전
**"모든 비즈니스 만남을 가치 있는 인맥 자산으로 전환하는 개인 네트워킹 플랫폼"**

명함을 단순히 디지털화하는 것을 넘어, 개인 사용자가 비즈니스 관계를 체계적으로 구축하고 관리할 수 있도록 돕는 지능형 명함 관리 서비스.

### 1.2 미션
- 명함 교환 후 발생하는 정보 손실과 관리 부재 문제를 해결
- 카메라 OCR 스캔과 수동 입력을 통해 명함 정보를 빠르고 정확하게 디지털화
- Web(Next.js)과 Mobile App(React Native)을 통해 언제 어디서나 인맥 정보에 접근
- 직관적인 정리, 검색, 내보내기 기능으로 인맥 관리의 생산성 극대화

### 1.3 문제 정의

| 문제 영역 | 상세 설명 |
|---|---|
| **명함 분실 및 훼손** | 종이 명함은 물리적 한계로 분실, 훼손, 정리 불가 상태가 빈번히 발생 |
| **정보 접근성 부재** | 필요한 순간에 특정 명함을 찾기 어렵고, 이동 중 접근 불가 |
| **수동 관리의 비효율** | 명함 정보를 하나씩 수동 입력하는 것은 시간 소모적이며 오류 발생 |
| **맥락 정보 누락** | 명함을 받은 상황, 대화 내용 등 관계의 맥락이 기록되지 않음 |
| **Cross-Platform 부재** | 기존 솔루션 대부분이 단일 플랫폼만 지원 |

### 1.4 대상 사용자
- **비즈니스 전문가:** 잦은 미팅과 네트워킹 이벤트에 참여하는 직장인
- **프리랜서/자영업자:** 다양한 클라이언트와의 관계를 관리하는 1인 사업자
- **영업/마케팅 담당자:** 대규모 인맥 관리가 업무 성과와 직결되는 직군
- **취업 준비생/신입 사원:** 경력 초기에 인맥 관리 습관을 형성하려는 사용자

### 1.5 경쟁 환경 분석

| 구분 | CamCard | ABBYY BCR | 본 서비스 (차별점) |
|---|---|---|---|
| 플랫폼 | Mobile 중심 | Mobile 중심 | **Web + Mobile 동시 지원** |
| OCR 정확도 | 높음 | 매우 높음 | Tesseract.js 기반 (Dual-pass 전처리) |
| 개인 사용자 최적화 | 기업 기능 과다 | 단순 스캔 중심 | **개인 네트워킹에 최적화된 UX** |
| 가격 | 유료 중심 | 유료 | **Freemium 모델** |

---

## 2. 사용자 페르소나

### 페르소나 1: 김현수 (네트워킹 활발한 마케팅 매니저)

| 항목 | 상세 |
|---|---|
| **나이/직업** | 34세, IT 기업 마케팅 매니저 |
| **디바이스** | iPhone 16 Pro, MacBook Pro, 업무용 Windows 노트북 |
| **주간 명함 교환량** | 10-15장 |
| **핵심 니즈** | 대량의 명함을 빠르게 스캔하고, 이벤트별/업종별로 분류하여 관리 |
| **Pain Points** | 컨퍼런스 후 수십 장 정리할 시간 없음, 특정 담당자 찾기 어려움, PC에서도 확인 필요 |
| **성공 기준** | "명함 스캔부터 정리까지 1장당 30초 이내" |

### 페르소나 2: 박서연 (프리랜서 디자이너)

| 항목 | 상세 |
|---|---|
| **나이/직업** | 28세, 프리랜서 UX/UI 디자이너 |
| **디바이스** | Galaxy S25, iPad Pro |
| **주간 명함 교환량** | 3-5장 |
| **핵심 니즈** | 클라이언트, 협력업체 담당자 연락처 체계적 관리, 프로젝트별 그룹화 |
| **Pain Points** | 다시 연락처 요청하는 것이 비전문적, 프로젝트 재협업 시 연락처 찾기 어려움 |
| **성공 기준** | "클라이언트 이름만 검색해도 바로 연락처와 관련 정보가 표시" |

### 페르소나 3: 이준호 (취업 준비 중인 대학원생)

| 항목 | 상세 |
|---|---|
| **나이/직업** | 26세, 경영학 석사 과정 (취업 준비 중) |
| **디바이스** | iPhone 15, 중고 MacBook Air |
| **주간 명함 교환량** | 1-3장 |
| **핵심 니즈** | 취업 관련 인맥 체계적 관리, 만남 맥락 기록 |
| **Pain Points** | 후속 조치 잊어버림, 무료 도구 부재, 대화 내용 기억 어려움 |
| **성공 기준** | "무료 요금제로 기본 기능을 충분히 사용" |

---

## 3. 핵심 기능 - MVP

> P0 = 출시 필수, P1 = 출시 권장, P2 = 출시 후 빠른 추가

### 3.1 사용자 인증 (User Authentication) `P0`

- **인증 방식:** 이메일/비밀번호, Google OAuth 2.0, Apple Sign-In, Kakao Login
- **기술:** Web: Auth.js (NextAuth v5) / Mobile: Firebase Auth
- **세션 관리:** JWT 기반 - Access Token (15분) + Refresh Token (7일)
- **보안:** 비밀번호 8자 이상 (영문+숫자+특수문자), 로그인 5회 실패 시 15분 잠금

### 3.2 명함 스캔 - OCR `P0`

- **기술:** Tesseract.js (Worker Pool + Dual-pass 전처리)
- **스캔 플로우:**
  1. 카메라 활성화 및 명함 프레임 가이드 표시
  2. 자동/수동 촬영
  3. 이미지 전처리 (Sharp: 리사이즈, 그레이스케일, 이진화, 샤프닝)
  4. Dual-pass OCR 실행 (일반 + 반전 전처리 병렬) 및 confidence 비교
  5. 추출 텍스트를 구조화된 필드로 파싱 (이름, 회사, 직함, 전화, 이메일, 주소, 웹사이트)
  6. 사용자 검증 및 수정 화면 표시
  7. 확인 후 저장
- **이미지 처리:** 원본 S3 저장, 자동 크롭/원근 보정, 최대 10MB, JPEG/PNG/HEIC 지원
- **다국어:** 한국어, 영어, 일본어, 중국어 우선 지원
- **수용 기준:** 인쇄 명함 정확도 95%+, 스캔~결과 3초 이내, 연속 스캔 모드 지원

### 3.3 수동 명함 입력 `P0`

- **입력 필드:** 이름(필수), 회사명, 직함, 전화번호(복수), 이메일(복수), 주소, 웹사이트, 메모
- **부가 기능:** 명함 이미지 첨부, 입력 중 자동 저장(Draft), 회사명/직함 자동완성
- **수용 기준:** 전화번호/이메일 실시간 유효성 검증, 입력 완료 평균 45초 이내

### 3.4 명함 정리 - 폴더, 태그, 즐겨찾기 `P0`

- **폴더:** 사용자 정의 폴더, 하위 폴더 1단계, 폴더별 색상, 기본 "미분류" 폴더
- **태그:** 사용자 정의 태그, 명함당 최대 10개, 태그별 색상, 자동 제안
- **즐겨찾기:** 명함별 토글, 전용 필터/뷰 제공

### 3.5 검색 및 필터 `P1`

- **검색:** Full-text Search (모든 필드), 실시간 결과(Debounce 300ms), 최근 검색어(10개)
- **필터:** 폴더별, 태그별(AND/OR), 즐겨찾기, 등록일 범위, 회사명별
- **정렬:** 이름순, 최신 등록순, 최근 수정순, 회사명순
- **수용 기준:** 10,000건 기준 500ms 이내 응답

### 3.6 연락처 상세 보기 `P1`

- 모든 정보 상세 표시 + 스캔된 원본 이미지 확대
- **빠른 액션:** 전화 걸기, 이메일 보내기, 주소 지도 열기, 웹사이트 열기, vCard 공유
- **편집:** Inline 편집 모드, 모든 필드 수정, 이미지 재촬영/교체

### 3.7 연락처 내보내기 `P1`

- **형식:** vCard 3.0/4.0 (.vcf), CSV (.csv)
- **범위:** 개별, 선택 일괄, 폴더 단위, 태그 단위, 전체
- **수용 기준:** 1,000건 5초 이내 생성, 주요 연락처 앱 호환, CSV UTF-8 BOM 포함

---

## 4. Post-MVP 기능

### Phase 2 기능
| 기능 | 설명 |
|---|---|
| **AI 중복 감지** | Fuzzy Matching 기반 유사 명함 자동 감지 및 병합 제안 |
| **스마트 분류** | OCR 결과 기반 자동 태그/폴더 추천, 업종/직급 분석 |
| **미팅 메모** | 연락처별 텍스트/음성 메모, 타임라인 히스토리 |
| **디지털 명함 공유 - QR 코드** | 내 디지털 명함 생성 및 QR 코드 교환 |

### Phase 3 기능
| 기능 | 설명 |
|---|---|
| **캘린더 연동** | Google/Apple Calendar 연동, 후속 연락 리마인더 |
| **소셜 미디어 프로필 연결** | LinkedIn, Twitter/X 자동 매칭 |
| **명함 분석 대시보드** | 네트워크 성장 추이, 업종별 분포, 활동 통계 |
| **팀/그룹 공유 (B2B 확장)** | 팀 워크스페이스, 기업용 라이선스 |

---

## 5. 정보 구조

### 5.1 앱 구조

```
1. 온보딩 / 인증 Flow
   ├── 스플래시 화면
   ├── 온보딩 슬라이드 (최초 실행)
   ├── 로그인 / 회원가입
   └── 비밀번호 재설정

2. 메인 Tab Navigation
   ├── [홈] 명함 리스트 (카드형/리스트형) + 검색 + 필터/정렬
   ├── [스캔] 카메라 뷰파인더 + OCR 처리 + 결과 확인/수정
   ├── [폴더] 폴더 목록 + 폴더 내 명함 목록
   └── [설정] 프로필, 내보내기, 태그 관리, 알림, 도움말, 로그아웃

3. 상세 / 모달 화면
   ├── 명함 상세 / 편집
   ├── 수동 입력
   ├── 태그/폴더 선택 모달
   └── 내보내기 옵션 Sheet
```

### 5.2 핵심 사용자 흐름

| 흐름 | 경로 |
|---|---|
| **명함 스캔** | 홈 → 스캔 → 촬영 → OCR → 확인/수정 → 폴더/태그 지정 → 저장 |
| **수동 입력** | 홈 → (+) → 수동 입력 → 정보 입력 → 폴더/태그 지정 → 저장 |
| **검색 및 연락** | 홈 → 검색 → 결과 선택 → 상세 → 빠른 액션 (전화/이메일) |
| **명함 정리** | 홈 → 길게 누르기 → 복수 선택 → 폴더 이동 / 태그 추가 / 삭제 |
| **내보내기** | 설정 → 내보내기 → 범위 선택 → 형식 선택 → 파일 생성 |

### 5.3 Web vs Mobile 차이

| 영역 | Web (Next.js) | Mobile (React Native) |
|---|---|---|
| 네비게이션 | 좌측 사이드바 + 상단 헤더 | 하단 Tab Bar |
| 명함 리스트 | 테이블 뷰 + 카드 그리드 토글 | 카드 리스트 (스크롤) |
| 스캔 기능 | 파일 업로드 (드래그 앤 드롭) + WebRTC | 네이티브 카메라 모듈 |
| 상세 화면 | 우측 패널 (Split View) | 전체 화면 (Push Navigation) |
| 다중 선택 | 체크박스 클릭 | 길게 누르기 + 탭 |

---

## 6. 기술 아키텍처

### 6.1 시스템 아키텍처 개요

```
┌─────────────────────────────────────────────────────┐
│                   클라이언트 (Clients)                 │
│  ┌───────────────┐       ┌────────────────────────┐  │
│  │ Web App        │       │ Mobile App              │  │
│  │ (Next.js 15)   │       │ (React Native + Expo)   │  │
│  └───────┬───────┘       └───────────┬────────────┘  │
└──────────┼───────────────────────────┼────────────────┘
           │       HTTPS / REST API    │
           ▼                           ▼
┌──────────────────────────────────────────────────────┐
│              Backend API Layer                         │
│         Next.js API Routes (Vercel Serverless)        │
│    Auth │ Cards │ Folders │ Tags │ Scan │ Export      │
│                    Prisma ORM v6+                      │
└──────────────────────┬────────────────────────────────┘
                       │
┌──────────────────────┼────────────────────────────────┐
│              외부 서비스 (External)                      │
│  Tesseract.js (OCR)  │ PostgreSQL (Neon) │ AWS S3     │
│  Auth.js v5          │ Firebase Auth     │ Vercel     │
└───────────────────────────────────────────────────────┘
```

### 6.2 프론트엔드 기술 스택

**Web (Next.js 15)**

| 기술 | 용도 |
|---|---|
| Next.js 15 (App Router) | 웹 프레임워크 (RSC, Turbopack, Server Actions) |
| TypeScript 5.x | 타입 시스템 |
| Tailwind CSS 4 | 스타일링 |
| shadcn/ui | UI 컴포넌트 |
| Zustand | 클라이언트 상태 관리 |
| TanStack Query v5 | 서버 상태 관리 |
| React Hook Form + Zod | 폼 관리 + 유효성 검증 |
| next-intl | 다국어 지원 |

**Mobile (React Native + Expo)**

| 기술 | 용도 |
|---|---|
| React Native 0.76+ | 모바일 프레임워크 (New Architecture) |
| Expo SDK 52+ | 개발 플랫폼 (EAS Build/Update) |
| Expo Router | File-based Routing, Deep Linking |
| NativeWind v4 | Tailwind CSS 문법 스타일링 (Web 일관성) |
| Expo Camera | 네이티브 카메라 모듈 |
| Zustand + TanStack Query v5 | Web과 동일 상태 관리 |
| MMKV | 로컬 저장소 (AsyncStorage 10배 성능) |

**공유 코드 (Monorepo - Turborepo)**

```
packages/
  ├── shared-types/       # TypeScript 타입 정의
  ├── shared-utils/       # 유틸리티 함수 (포맷팅, 유효성 검증)
  ├── shared-constants/   # 공통 상수
  └── api-client/         # API 호출 함수 (fetch wrapper)
apps/
  ├── web/                # Next.js 웹 앱
  └── mobile/             # React Native 모바일 앱
```

### 6.3 백엔드 기술 스택

| 기술 | 용도 |
|---|---|
| Next.js API Routes | REST API 서버 (Serverless) |
| Prisma ORM v6+ | Type-safe DB ORM, Migration 관리 |
| PostgreSQL 16 (Neon) | 주 데이터베이스 (Full-text Search, Auto-scaling) |
| Tesseract.js | OCR 엔진 (Worker Pool + Dual-pass 전처리) |
| AWS S3 | 명함 이미지 저장소 |
| Auth.js v5 / Firebase Auth | Web / Mobile 인증 |
| Vercel | Web 배포 (Edge Functions, 자동 CI/CD) |
| Zod | 서버 측 유효성 검증 |
| Sharp | 서버 측 이미지 처리 |

### 6.4 OCR 파이프라인

```
[클라이언트]                  [서버]                    [외부]

카메라 촬영 →
클라이언트 전처리 →
(크롭, 회전, 압축)
                          → 이미지 수신
                          → S3 업로드           → AWS S3
                          → Dual-pass 전처리 (A: 일반 / B: 반전)
                          → Tesseract.js OCR (병렬 recognize, rotateAuto)
                          ← confidence 높은 결과 선택
                          → 텍스트 파싱/구조화
                            - 이메일: 정규식 매칭
                            - 전화: 정규식 매칭
                            - URL: 정규식 매칭
                            - 이름/회사/직함: 위치 기반 휴리스틱
                          ← 구조화된 결과 반환
사용자 검증/수정 ←
확인 후 저장 →
                          → DB 저장 (Prisma)
저장 완료 ←
```

### 6.5 인증 아키텍처

- **Web:** Auth.js v5 → JWT + Cookie Session
- **Mobile:** Firebase Auth → Firebase ID Token
- **API 미들웨어:** 양쪽 Token 모두 검증 → 통합 User 식별 (내부 userId)
- **DB:** User 테이블에 `authProvider`, `firebaseUid`, `authJsAccountId` 관리

---

## 7. 데이터 모델

### 7.1 ER 다이어그램

```
User (1) ──── (N) BusinessCard (N) ──── (M) Tag
  │                    │
  │ (1:N)              │ (1:N)
  │                    │
Folder (1) ────────── (N)  ContactDetail
  │
  └── (Self-ref) Folder (부모-자식)
```

### 7.2 Prisma Schema

```prisma
model User {
  id            String        @id @default(cuid())
  email         String        @unique
  name          String?
  passwordHash  String?
  avatarUrl     String?
  authProvider  AuthProvider   @default(EMAIL)  // EMAIL | GOOGLE | APPLE | KAKAO
  firebaseUid   String?       @unique
  emailVerified DateTime?
  cards         BusinessCard[]
  folders       Folder[]
  tags          Tag[]
  accounts      Account[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

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
  scanMethod     ScanMethod      @default(MANUAL)  // OCR_CAMERA | OCR_GALLERY | MANUAL
  isFavorite     Boolean         @default(false)
  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  folder         Folder?         @relation(fields: [folderId], references: [id], onDelete: SetNull)
  contactDetails ContactDetail[]
  tags           CardTag[]
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  @@index([userId])
  @@index([folderId])
  @@index([userId, name])
  @@index([userId, company])
  @@index([userId, createdAt(sort: Desc)])
}

model ContactDetail {
  id        String      @id @default(cuid())
  cardId    String
  type      ContactType // PHONE | EMAIL | FAX | MOBILE | OTHER
  label     String?     // "업무용", "개인" 등
  value     String
  isPrimary Boolean     @default(false)
  card      BusinessCard @relation(fields: [cardId], references: [id], onDelete: Cascade)

  @@index([cardId])
  @@index([cardId, type])
}

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
}

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
```

### 7.3 데이터 관계 요약

| 관계 | 카디널리티 |
|---|---|
| User → BusinessCard | 1:N |
| User → Folder | 1:N |
| User → Tag | 1:N |
| Folder → BusinessCard | 1:N (nullable) |
| Folder → Folder | 1:N (Self-ref) |
| BusinessCard ↔ Tag | N:M (via CardTag) |
| BusinessCard → ContactDetail | 1:N |

---

## 8. API 설계

**Base URL:** `/api/v1` | **형식:** RESTful JSON | **인증:** Bearer Token | **페이지네이션:** Cursor-based

### 8.1 인증 API
```
POST   /api/v1/auth/register          # 회원가입
POST   /api/v1/auth/login             # 로그인
POST   /api/v1/auth/logout            # 로그아웃
POST   /api/v1/auth/refresh           # 토큰 갱신
POST   /api/v1/auth/forgot-password   # 비밀번호 재설정 요청
POST   /api/v1/auth/reset-password    # 비밀번호 재설정 실행
POST   /api/v1/auth/verify-email      # 이메일 인증
GET    /api/v1/auth/me                # 현재 사용자 정보
```

### 8.2 명함 API
```
GET    /api/v1/cards                   # 목록 조회 (검색, 필터, 페이지네이션)
POST   /api/v1/cards                   # 명함 생성 (수동 입력)
GET    /api/v1/cards/:id               # 상세 조회
PUT    /api/v1/cards/:id               # 수정
DELETE /api/v1/cards/:id               # 삭제
PATCH  /api/v1/cards/:id/favorite      # 즐겨찾기 토글
PATCH  /api/v1/cards/:id/folder        # 폴더 이동
POST   /api/v1/cards/:id/tags          # 태그 추가
DELETE /api/v1/cards/:id/tags/:tagId   # 태그 제거
POST   /api/v1/cards/batch/delete      # 일괄 삭제
POST   /api/v1/cards/batch/move        # 일괄 폴더 이동
POST   /api/v1/cards/batch/tag         # 일괄 태그 추가
```

### 8.3 OCR 스캔 API
```
POST   /api/v1/scan/upload             # 이미지 업로드 + OCR 처리
POST   /api/v1/scan/confirm            # OCR 결과 확인 후 명함 저장
```

### 8.4 폴더 / 태그 / 내보내기 API
```
# 폴더
GET    /api/v1/folders                 # 폴더 목록 (트리 구조)
POST   /api/v1/folders                 # 생성
PUT    /api/v1/folders/:id             # 수정
DELETE /api/v1/folders/:id             # 삭제

# 태그
GET    /api/v1/tags                    # 태그 목록
POST   /api/v1/tags                    # 생성
PUT    /api/v1/tags/:id                # 수정
DELETE /api/v1/tags/:id                # 삭제

# 내보내기
POST   /api/v1/export/vcard            # vCard 내보내기
POST   /api/v1/export/csv              # CSV 내보내기
```

### 8.5 API 요청/응답 예시

**GET /api/v1/cards (목록 조회)**
```
GET /api/v1/cards?search=김&folderId=xxx&tagIds=yyy,zzz&isFavorite=true&sort=createdAt&order=desc&cursor=abc123&limit=20
```

```json
{
  "data": [
    {
      "id": "clx2def...",
      "name": "김철수",
      "company": "테크코리아 주식회사",
      "jobTitle": "CTO",
      "thumbnailUrl": "https://cdn.../thumb_123.jpg",
      "isFavorite": true,
      "folder": { "id": "...", "name": "IT 업계", "color": "#6366F1" },
      "tags": [{ "id": "...", "name": "VIP", "color": "#EF4444" }],
      "contactDetails": [
        { "type": "PHONE", "label": "업무용", "value": "+82-10-1234-5678", "isPrimary": true },
        { "type": "EMAIL", "value": "chulsoo@techkorea.com", "isPrimary": true }
      ],
      "createdAt": "2026-01-15T14:30:00.000Z"
    }
  ],
  "meta": {
    "nextCursor": "clx2ghi...",
    "hasMore": true,
    "totalCount": 156
  }
}
```

**POST /api/v1/scan/upload (OCR 스캔)**
```json
// Response
{
  "data": {
    "scanId": "scan_abc123",
    "imageUrl": "https://s3.../original_456.jpg",
    "ocrResult": {
      "rawText": "김철수\nCTO\n테크코리아 주식회사\nchulsoo@techkorea.com\n010-1234-5678",
      "confidence": 0.97,
      "parsed": {
        "name": "김철수",
        "company": "테크코리아 주식회사",
        "jobTitle": "CTO",
        "contactDetails": [
          { "type": "EMAIL", "value": "chulsoo@techkorea.com" },
          { "type": "PHONE", "value": "010-1234-5678" }
        ]
      }
    }
  }
}
```

### 8.6 에러 응답 형식 (RFC 7807)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다.",
    "details": [
      { "field": "email", "message": "유효한 이메일 주소를 입력해주세요." }
    ]
  }
}
```

---

## 9. 비기능적 요구사항

### 9.1 성능

| 지표 | 목표치 |
|---|---|
| Web LCP | 2.5초 이내 |
| Mobile Cold Start | 3초 이내 |
| API 응답 (일반) | P95 < 500ms |
| API 응답 (OCR) | P95 < 3s |
| 검색 (10,000건) | < 500ms |
| 동시 접속 (MVP) | 1,000명 |

### 9.2 보안

- **암호화:** TLS 1.3 (전송), AES-256 (저장), bcrypt cost 12 (비밀번호)
- **인증:** JWT Stateless, CSRF Protection, Rate Limiting
- **API:** Input Validation (Zod), SQL Injection 방지 (Prisma), XSS 방지 (CSP), CORS 화이트리스트
- **프라이버시:** GDPR/개인정보보호법 준수, 최소 수집, 계정 삭제 시 영구 삭제(30일 유예)

### 9.3 확장성

- Vercel Serverless 자동 스케일링
- Neon Serverless Postgres Auto-scaling
- AWS S3 + CloudFront CDN
- 사용자당 최대 50,000장 명함 지원

### 9.4 접근성

- WCAG 2.1 AA 준수
- 스크린 리더 호환 (ARIA, VoiceOver/TalkBack)
- 키보드 네비게이션, 색상 대비 4.5:1, Dynamic Type

### 9.5 테스트 전략

| 유형 | 도구 | 커버리지 |
|---|---|---|
| 단위 테스트 | Vitest / Jest | 핵심 로직 80%+ |
| 통합 테스트 | Vitest + Prisma Test | API 전체 |
| E2E 테스트 | Playwright / Detox | 핵심 흐름 100% |
| 부하 테스트 | k6 | 출시 전 + 분기별 |

---

## 10. 성공 지표

**출시 후 6개월 목표**

| 카테고리 | KPI | 목표 |
|---|---|---|
| 사용자 획득 | 총 가입자 수 | 10,000명 |
| 활성도 | MAU | 3,000명 (30%) |
| 활성도 | DAU/MAU | 20%+ |
| 리텐션 | Day 1 / Day 7 / Day 30 | 60% / 40% / 25% |
| 핵심 기능 | OCR 정확도 | 95%+ (수정 불필요) |
| 핵심 기능 | 사용자당 평균 저장 | 50장+ |
| 핵심 기능 | 스캔 완료율 | 85%+ |
| 만족도 | App Store 평점 | 4.5+ |
| 기술 | API P95 응답 | 500ms 이내 |
| 기술 | Crash Rate | 0.5% 미만 |

### 핵심 퍼널 지표

```
가입 퍼널:
  앱 설치/접속 → 가입 시작 → 가입 완료 → 이메일 인증
  목표 전환율: 50% → 80% → 70%

스캔 퍼널:
  스캔 시작 → 촬영 완료 → OCR 결과 확인 → 수정/확인 → 저장 완료
  목표 전환율: 95% → 90% → 95% → 95%

활성화 퍼널:
  가입 → 첫 명함 저장 → 5장 이상 저장 → 첫 검색 사용 → 첫 내보내기
  목표: 가입 후 24시간 내 첫 명함 저장 비율 70%
```

---

## 11. 개발 단계 및 마일스톤

### Phase 1: MVP (8주)

| 주차 | 마일스톤 | 주요 작업 |
|---|---|---|
| 1-2 | 프로젝트 셋업 | Monorepo(Turborepo), Next.js/Expo 초기화, Prisma Schema, CI/CD, 디자인 시스템 |
| 3-4 | 인증 + 핵심 CRUD | Auth.js/Firebase Auth, 명함 수동입력/조회/수정/삭제 |
| 5-6 | OCR + 정리 기능 | Tesseract.js 연동, S3 업로드, OCR 파싱, 폴더/태그/즐겨찾기 |
| 7-8 | 검색 + 내보내기 + QA | Full-text Search, 필터/정렬, vCard/CSV 내보내기, E2E 테스트, 배포 |

**MVP 출시 기준 (Definition of Done):**
- 모든 P0 기능 완성 및 P1 기능 80% 이상 완성
- 핵심 사용자 흐름 E2E 테스트 통과
- Lighthouse Performance Score 80 이상 (Web)
- Crash-free Rate 99% 이상 (Mobile)
- 보안 감사 완료 (OWASP Top 10 체크리스트)

### Phase 2: 고도화 (6주)

| 주차 | 마일스톤 | 주요 작업 |
|---|---|---|
| 9-10 | AI 기능 | 중복 감지(Fuzzy Matching), 스마트 분류, UX 개선 |
| 11-12 | 메모 + 디지털 공유 | 연락처별 메모/노트, 디지털 명함, QR 코드 공유 |
| 13-14 | 안정화 | 성능 최적화, 오프라인 캐시, Push Notification, 정식 스토어 출시 |

### Phase 3: 확장 (8주)

| 주차 | 마일스톤 | 주요 작업 |
|---|---|---|
| 15-18 | 외부 연동 | Calendar 연동, SNS 프로필 매칭, 분석 대시보드, Stripe 결제 |
| 19-22 | B2B 확장 | 팀 워크스페이스, 관리자 대시보드, 기업 라이선스, A/B 테스트 |

---

## 12. 리스크 평가

### 기술적 리스크

| 리스크 | 확률 | 영향 | 완화 전략 |
|---|---|---|---|
| OCR 정확도 미달 | 중 | 높 | Tesseract.js Dual-pass 전처리 (일반/반전), PSM SPARSE_TEXT, 수정 UI 핵심 UX화 |
| Cross-Platform 코드 공유율 저조 | 중 | 중 | Monorepo + 공유 패키지, 비즈니스 로직 공유, UI만 분리 |
| Serverless Cold Start | 낮 | 중 | Edge Functions, Warming 전략, Connection Pooling |
| 이미지 처리 병목 | 중 | 중 | 클라이언트 전처리, S3 Presigned URL, 비동기 처리 |
| 인증 통합 복잡도 | 중 | 높 | 통합 User 테이블, 양쪽 Token 미들웨어, 향후 Clerk 검토 |

### 비즈니스 리스크

| 리스크 | 확률 | 영향 | 완화 전략 |
|---|---|---|---|
| 시장 경쟁 심화 | 높 | 중 | Web+Mobile 차별점, 개인 UX 집중, 빠른 MVP 출시 |
| 사용자 확보 어려움 | 중 | 높 | Freemium 모델, 타겟 마케팅, Product Hunt 활용 |
| 수익 모델 불확실 | 중 | 높 | Phase 1은 사용자 획득, Phase 2에서 프리미엄 도입 |
| 개인정보보호 규제 | 낮 | 높 | 법률 자문, 최소 수집, 데이터 보관/삭제 정책 |

---

## 부록 A: 요금제 구상

| 구분 | Free | Pro (월 ₩4,900) |
|---|---|---|
| 명함 저장 | 200장 | 무제한 |
| OCR 스캔 | 월 30장 | 무제한 |
| 폴더 | 5개 | 무제한 |
| 태그 | 10개 | 무제한 |
| 내보내기 | vCard 단건 | vCard/CSV 일괄 |
| AI 중복 감지 | X | O (Phase 2) |
| 스마트 분류 | X | O (Phase 2) |

---

## 부록 B: 프로젝트 디렉토리 구조

```
cardkeeper/
├── apps/
│   ├── web/                          # Next.js 15 Web App
│   │   ├── src/
│   │   │   ├── app/                  # App Router
│   │   │   │   ├── (auth)/           # login, register
│   │   │   │   ├── (main)/           # cards, folders, scan, settings
│   │   │   │   └── api/v1/           # API Route Handlers
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   └── hooks/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── package.json
│   │
│   └── mobile/                       # React Native Expo App
│       ├── app/                      # Expo Router
│       │   ├── (auth)/
│       │   ├── (tabs)/               # index, scan, folders, settings
│       │   └── card/[id].tsx
│       ├── components/
│       ├── hooks/
│       └── package.json
│
├── packages/
│   ├── shared-types/                 # API/엔티티 타입
│   ├── shared-utils/                 # Zod 스키마, 포맷터
│   ├── shared-constants/             # 에러 코드, 설정값
│   └── api-client/                   # HTTP Client, API 함수
│
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

---

## 부록 C: 용어 정의

| 용어 | 정의 |
|---|---|
| **OCR** | Optical Character Recognition - 이미지에서 텍스트를 인식하는 기술 |
| **vCard** | Virtual Contact File - 전자 명함 표준 파일 형식 (.vcf) |
| **MVP** | Minimum Viable Product - 최소 기능 제품 |
| **MAU** | Monthly Active Users - 월간 활성 사용자 수 |
| **DAU** | Daily Active Users - 일간 활성 사용자 수 |
| **LCP** | Largest Contentful Paint - 웹 성능 지표 |
| **NPS** | Net Promoter Score - 순 추천 고객 지수 |
| **EAS** | Expo Application Services - Expo 빌드/배포 서비스 |
| **PIPA** | Personal Information Protection Act - 개인정보보호법 |

---

**문서 끝**

**작성:** Product Team
**검토 대상:** 개발팀, 디자인팀, 경영진
**다음 단계:** 디자인 시안 작성 및 기술 Spike 진행
