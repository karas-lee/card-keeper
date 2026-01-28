# 01. 프로젝트 셋업 & 인프라

---

## 1. Turborepo 모노레포 초기화

### 1.1 루트 `package.json`

```json
{
  "name": "cardkeeper",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "type-check": "turbo type-check",
    "test": "turbo test",
    "test:e2e": "turbo test:e2e",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "db:generate": "pnpm --filter web exec prisma generate",
    "db:push": "pnpm --filter web exec prisma db push",
    "db:migrate:dev": "pnpm --filter web exec prisma migrate dev",
    "db:migrate:deploy": "pnpm --filter web exec prisma migrate deploy",
    "db:seed": "pnpm --filter web exec prisma db seed",
    "db:studio": "pnpm --filter web exec prisma studio"
  },
  "devDependencies": {
    "turbo": "^2.3.0",
    "prettier": "^3.4.0",
    "@changesets/cli": "^2.27.0"
  }
}
```

### 1.2 `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 1.3 `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "globalEnv": [
    "NODE_ENV",
    "DATABASE_URL",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "test:e2e": {
      "dependsOn": ["build"]
    }
  }
}
```

### 1.4 디렉토리 구조 (초기)

```
cardkeeper/
├── apps/
│   ├── web/                    # Next.js 15
│   └── mobile/                 # React Native Expo
├── packages/
│   ├── shared-types/           # TypeScript 타입
│   ├── shared-utils/           # Zod 스키마, 포맷터
│   ├── shared-constants/       # 상수, 에러 코드
│   ├── api-client/             # HTTP Client
│   ├── typescript-config/      # 공유 tsconfig
│   └── eslint-config/          # 공유 ESLint 설정
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── .gitignore
├── .prettierrc
├── .prettierignore
├── .nvmrc                      # Node.js 20 LTS
└── .github/
    └── workflows/
        ├── ci.yml
        └── deploy.yml
```

---

## 2. 공유 TypeScript 설정

### 2.1 `packages/typescript-config/base.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ES2022",
    "lib": ["ES2022"],
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUncheckedIndexedAccess": true
  },
  "exclude": ["node_modules", "dist"]
}
```

### 2.2 `packages/typescript-config/nextjs.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowJs": true,
    "noEmit": true,
    "plugins": [{ "name": "next" }]
  }
}
```

### 2.3 `packages/typescript-config/react-native.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2022"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "noEmit": true,
    "types": ["nativewind/types"]
  }
}
```

### 2.4 `packages/typescript-config/library.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

---

## 3. 공유 ESLint 설정

### 3.1 `packages/eslint-config/package.json`

```json
{
  "name": "@cardkeeper/eslint-config",
  "version": "0.0.0",
  "private": true,
  "exports": {
    "./base": "./base.js",
    "./nextjs": "./nextjs.js",
    "./react-native": "./react-native.js"
  },
  "dependencies": {
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-import": "^2.31.0"
  }
}
```

### 3.2 `packages/eslint-config/base.js`

```js
/** @type {import("eslint").Linter.Config} */
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/consistent-type-imports": "error",
    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        alphabetize: { order: "asc" },
      },
    ],
  },
  ignorePatterns: ["dist/", "node_modules/", ".next/", ".expo/"],
};
```

---

## 4. Next.js 15 웹앱 초기화

### 4.1 `apps/web/package.json` (핵심 의존성)

```json
{
  "name": "web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next-auth": "^5.0.0-beta.25",
    "@auth/prisma-adapter": "^2.7.0",
    "@prisma/client": "^6.2.0",
    "@tanstack/react-query": "^5.62.0",
    "zustand": "^5.0.0",
    "react-hook-form": "^7.54.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.24.0",
    "next-intl": "^4.0.0",
    "sharp": "^0.33.0",
    "jose": "^5.9.0",
    "bcrypt": "^5.1.0",
    "@aws-sdk/client-s3": "^3.700.0",
    "@aws-sdk/s3-request-presigner": "^3.700.0",
    "@google-cloud/vision": "^4.3.0",
    "lucide-react": "^0.468.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.6.0",
    "@cardkeeper/shared-types": "workspace:*",
    "@cardkeeper/shared-utils": "workspace:*",
    "@cardkeeper/shared-constants": "workspace:*",
    "@cardkeeper/api-client": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "prisma": "^6.2.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/bcrypt": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.4.0",
    "@cardkeeper/typescript-config": "workspace:*",
    "@cardkeeper/eslint-config": "workspace:*"
  }
}
```

### 4.2 `apps/web/next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@cardkeeper/shared-types",
    "@cardkeeper/shared-utils",
    "@cardkeeper/shared-constants",
    "@cardkeeper/api-client",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
```

### 4.3 `apps/web/postcss.config.mjs`

```js
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

### 4.4 `apps/web/src/app/globals.css`

```css
@import "tailwindcss";
```

### 4.5 `apps/web/tsconfig.json`

```json
{
  "extends": "@cardkeeper/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 5. React Native Expo 모바일앱 초기화

### 5.1 `apps/mobile/package.json` (핵심 의존성)

```json
{
  "name": "mobile",
  "version": "0.1.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "dev": "expo start",
    "build:ios": "eas build --platform ios",
    "build:android": "eas build --platform android",
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-camera": "~16.0.0",
    "expo-image-picker": "~16.0.0",
    "expo-file-system": "~18.0.0",
    "expo-haptics": "~14.0.0",
    "expo-secure-store": "~14.0.0",
    "expo-image": "~2.0.0",
    "expo-linking": "~7.0.0",
    "expo-status-bar": "~2.0.0",
    "react": "^19.0.0",
    "react-native": "~0.76.0",
    "react-native-reanimated": "~3.16.0",
    "react-native-gesture-handler": "~2.21.0",
    "react-native-safe-area-context": "~5.0.0",
    "react-native-screens": "~4.4.0",
    "react-native-mmkv": "^3.2.0",
    "nativewind": "^4.1.0",
    "@react-navigation/native": "^7.0.0",
    "@firebase/auth": "^1.8.0",
    "react-native-firebase": "^6.0.0",
    "@tanstack/react-query": "^5.62.0",
    "zustand": "^5.0.0",
    "react-hook-form": "^7.54.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.24.0",
    "@gorhom/bottom-sheet": "^5.0.0",
    "@cardkeeper/shared-types": "workspace:*",
    "@cardkeeper/shared-utils": "workspace:*",
    "@cardkeeper/shared-constants": "workspace:*",
    "@cardkeeper/api-client": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/react": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "@cardkeeper/typescript-config": "workspace:*",
    "@cardkeeper/eslint-config": "workspace:*"
  }
}
```

### 5.2 `apps/mobile/app.json`

```json
{
  "expo": {
    "name": "CardKeeper",
    "slug": "cardkeeper",
    "version": "0.1.0",
    "scheme": "cardkeeper",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#6366F1"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.cardkeeper.app",
      "infoPlist": {
        "NSCameraUsageDescription": "명함을 스캔하기 위해 카메라 접근이 필요합니다.",
        "NSPhotoLibraryUsageDescription": "갤러리에서 명함 이미지를 선택하기 위해 사진 접근이 필요합니다."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#6366F1"
      },
      "package": "com.cardkeeper.app",
      "permissions": ["CAMERA", "READ_EXTERNAL_STORAGE"]
    },
    "plugins": [
      "expo-router",
      "expo-camera",
      "expo-image-picker",
      "expo-secure-store"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

### 5.3 `apps/mobile/tsconfig.json`

```json
{
  "extends": "@cardkeeper/typescript-config/react-native.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

---

## 6. 공유 패키지 구조

각 패키지의 상세 내용은 `06-shared-packages.md`에서 정의. 여기서는 기본 구조만 명시.

### 6.1 공통 `package.json` 패턴

```json
{
  "name": "@cardkeeper/<package-name>",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint src/"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@cardkeeper/typescript-config": "workspace:*"
  }
}
```

### 6.2 패키지 목록

| 패키지 | 역할 | 주요 exports |
|--------|------|-------------|
| `shared-types` | TypeScript 타입/인터페이스 | Entity types, API types, Enums |
| `shared-utils` | Zod 스키마, 포맷터, 검증 | Zod schemas, formatters, validators |
| `shared-constants` | 에러 코드, 제한값, 설정값 | Error codes, limits, config |
| `api-client` | HTTP 클라이언트, API 함수 | ApiClient class, endpoint functions |
| `typescript-config` | 공유 tsconfig | base, nextjs, react-native, library |
| `eslint-config` | 공유 ESLint | base, nextjs, react-native |

---

## 7. Prisma Schema & Neon PostgreSQL

### 7.1 Prisma 설정

```
apps/web/prisma/
├── schema.prisma
├── migrations/
│   └── (auto-generated)
└── seed.ts
```

### 7.2 `prisma/schema.prisma` (데이터소스 및 제너레이터)

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "fullTextIndex"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
```

> 전체 스키마는 `07-database-schema.md`에서 상세 정의

### 7.3 Neon PostgreSQL 연결

- **Connection Pooling:** Neon Serverless Driver 사용
- `DATABASE_URL`: Pooled connection string (`pgbouncer=true`)
- `DIRECT_DATABASE_URL`: Direct connection (마이그레이션용)

---

## 8. 인증 인프라

### 8.1 Auth.js v5 (웹)

```
apps/web/src/lib/auth/
├── auth.config.ts          # Auth.js 설정
├── auth.ts                 # NextAuth 인스턴스
├── providers/
│   ├── credentials.ts      # 이메일/비밀번호
│   ├── google.ts           # Google OAuth
│   ├── apple.ts            # Apple Sign-In
│   └── kakao.ts            # Kakao Login
└── callbacks/
    ├── jwt.ts              # JWT 콜백
    └── session.ts          # Session 콜백
```

### 8.2 Firebase Auth (모바일)

```
apps/mobile/src/lib/auth/
├── firebase.ts             # Firebase 초기화
├── auth-service.ts         # 인증 서비스 래퍼
└── providers/
    ├── email.ts
    ├── google.ts
    ├── apple.ts
    └── kakao.ts
```

### 8.3 통합 인증 미들웨어

```
apps/web/src/lib/middleware/
├── auth.ts                 # 통합 인증 미들웨어
│                           # - Auth.js JWT → userId 추출
│                           # - Firebase ID Token → userId 추출
│                           # - 공통 AuthContext 생성
```

---

## 9. AWS S3 + CloudFront 이미지 스토리지

### 9.1 S3 버킷 구조

```
cardkeeper-images-{env}/
├── originals/              # 원본 이미지
│   └── {userId}/{cardId}/{filename}
├── thumbnails/             # 썸네일 (200x200)
│   └── {userId}/{cardId}/{filename}
└── temp/                   # OCR 처리 임시 저장
    └── {scanId}/{filename}
```

### 9.2 CloudFront 설정

- **Origin:** S3 버킷
- **Cache Policy:** 이미지 1년, 썸네일 1년
- **OAI (Origin Access Identity):** S3 직접 접근 차단
- **Custom Domain:** `cdn.cardkeeper.app`

### 9.3 Presigned URL 전략

- **업로드:** 클라이언트 → API (presigned URL 요청) → 클라이언트 → S3 직접 업로드
- **다운로드:** CloudFront URL 직접 사용 (public read via CDN)

---

## 10. CI/CD (GitHub Actions + Vercel)

### 10.1 GitHub Actions - CI (`ci.yml`)

```yaml
name: CI
on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: cardkeeper_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/cardkeeper_test

  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter web exec playwright install --with-deps
      - run: pnpm test:e2e
```

### 10.2 Vercel 배포

- **Production:** `main` 브랜치 → `cardkeeper.app`
- **Preview:** PR별 자동 프리뷰 → `*.vercel.app`
- **환경 변수:** Vercel Dashboard에서 관리

### 10.3 모바일 배포 (EAS)

- **Development:** `eas build --profile development`
- **Preview:** `eas update --branch preview`
- **Production:** `eas build --profile production` → App Store / Play Store

---

## 11. 환경 변수 관리

### 11.1 `.env.local` (웹 개발)

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/cardkeeper?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://user:pass@host:5432/cardkeeper"

# Auth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-change-in-production"

# OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
APPLE_CLIENT_ID=""
APPLE_CLIENT_SECRET=""
KAKAO_CLIENT_ID=""
KAKAO_CLIENT_SECRET=""

# Firebase (모바일 토큰 검증용)
FIREBASE_PROJECT_ID=""
FIREBASE_CLIENT_EMAIL=""
FIREBASE_PRIVATE_KEY=""

# AWS S3
AWS_REGION="ap-northeast-2"
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET="cardkeeper-images-dev"
AWS_CLOUDFRONT_URL="https://cdn-dev.cardkeeper.app"

# Google Cloud Vision
GOOGLE_CLOUD_PROJECT_ID=""
GOOGLE_CLOUD_CREDENTIALS=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_CDN_URL="https://cdn-dev.cardkeeper.app"
```

### 11.2 `.env` (모바일)

```bash
EXPO_PUBLIC_API_URL="http://localhost:3000/api/v1"
EXPO_PUBLIC_CDN_URL="https://cdn-dev.cardkeeper.app"

# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=""
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=""
EXPO_PUBLIC_FIREBASE_PROJECT_ID=""
EXPO_PUBLIC_FIREBASE_APP_ID=""
```

### 11.3 환경별 구분

| 환경 | DB | S3 Bucket | CDN | API URL |
|------|-----|-----------|-----|---------|
| Development | `cardkeeper_dev` (Local/Neon Dev) | `cardkeeper-images-dev` | `cdn-dev.cardkeeper.app` | `localhost:3000` |
| Staging | `cardkeeper_staging` (Neon Branch) | `cardkeeper-images-staging` | `cdn-staging.cardkeeper.app` | `staging.cardkeeper.app` |
| Production | `cardkeeper_prod` (Neon Main) | `cardkeeper-images-prod` | `cdn.cardkeeper.app` | `cardkeeper.app` |

---

## 12. 디자인 시스템 기초

### 12.1 테마 색상

```typescript
// packages/shared-constants/src/theme.ts
export const colors = {
  primary: {
    50: "#EEF2FF",
    100: "#E0E7FF",
    200: "#C7D2FE",
    300: "#A5B4FC",
    400: "#818CF8",
    500: "#6366F1",  // Main
    600: "#4F46E5",
    700: "#4338CA",
    800: "#3730A3",
    900: "#312E81",
    950: "#1E1B4B",
  },
  // Tailwind CSS 4 기본 팔레트 활용
  // shadcn/ui 테마 시스템과 연동
} as const;
```

### 12.2 프로바이더 구조 (웹)

```
apps/web/src/app/providers.tsx
├── QueryClientProvider (TanStack Query)
├── ThemeProvider (next-themes)
├── NextIntlClientProvider (i18n)
└── Toaster (sonner)
```

### 12.3 프로바이더 구조 (모바일)

```
apps/mobile/src/providers/
├── QueryClientProvider (TanStack Query)
├── GestureHandlerRootView
├── SafeAreaProvider
├── BottomSheetModalProvider
└── AuthProvider (Firebase)
```

### 12.4 i18n 설정

- **기본 언어:** 한국어 (ko)
- **지원 언어:** 영어 (en), 일본어 (ja)
- **메시지 파일:** `apps/web/messages/{locale}.json`
- **라이브러리:** next-intl (웹), 자체 구현 (모바일, 향후 react-i18next)

---

**다음 문서:** [02-backend-api.md](./02-backend-api.md)
