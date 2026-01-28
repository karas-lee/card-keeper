# CardKeeper Monorepo Makefile
# Usage: make [target]

.DEFAULT_GOAL := help

# 환경변수 오버라이드 가능 변수
BASE_URL ?= http://localhost:3000

.PHONY: install setup dev dev-web dev-web-https dev-mobile build start build-ios build-android \
        db-generate db-push db-migrate db-migrate-deploy db-seed db-studio \
        test test-e2e test-load lint type-check format format-check check clean help

# ============================================================================
# 설치 및 초기 설정
# ============================================================================

install: ## 전체 의존성 설치
	pnpm install

setup: install db-generate db-migrate ## 프로젝트 초기 셋업 (신규 환경)

# ============================================================================
# 개발 서버 실행
# ============================================================================

dev: ## 전체 앱 개발 서버 (Turborepo)
	pnpm dev

dev-web: ## 웹 앱만 실행 (Next.js, port 3000)
	pnpm dev:web

dev-web-https: ## 웹 앱 HTTPS 실행 (외부 기기 테스트용)
	pnpm dev:web:https

dev-mobile: ## 모바일 앱만 실행 (Expo)
	pnpm dev:mobile

# ============================================================================
# 빌드 및 앱 실행
# ============================================================================

build: ## 전체 프로덕션 빌드
	pnpm build

start: ## 웹 프로덕션 서버 시작 (next start)
	pnpm --filter web start

build-ios: ## iOS 앱 빌드 (EAS Build)
	pnpm --filter mobile build:ios

build-android: ## Android 앱 빌드 (EAS Build)
	pnpm --filter mobile build:android

# ============================================================================
# 데이터베이스
# ============================================================================

db-generate: ## Prisma 클라이언트 생성
	pnpm db:generate

db-push: ## DB 스키마 푸시
	pnpm db:push

db-migrate: ## 개발 마이그레이션 실행
	pnpm db:migrate:dev

db-migrate-deploy: ## 프로덕션 마이그레이션 배포
	pnpm db:migrate:deploy

db-seed: ## 시드 데이터 투입
	pnpm db:seed

db-studio: ## Prisma Studio (DB GUI)
	pnpm db:studio

# ============================================================================
# 테스트
# ============================================================================

test: ## 전체 단위 테스트 (Vitest)
	pnpm test

test-e2e: ## E2E 테스트 (Playwright/Detox)
	pnpm test:e2e

test-load: ## 부하 테스트 (k6)
	k6 run k6/load-test.js

# ============================================================================
# 코드 품질
# ============================================================================

lint: ## ESLint 실행
	pnpm lint

type-check: ## TypeScript 타입 체크
	pnpm type-check

format: ## Prettier 포맷팅
	pnpm format

format-check: ## 포맷 검사만
	pnpm format:check

check: lint type-check format-check ## CI와 동일한 전체 검사

# ============================================================================
# 정리
# ============================================================================

clean: ## 빌드 캐시 및 의존성 정리
	rm -rf node_modules
	rm -rf apps/*/node_modules packages/*/node_modules
	rm -rf .turbo apps/*/.turbo packages/*/.turbo
	rm -rf apps/web/.next
	rm -rf apps/mobile/.expo
	rm -rf packages/*/dist

# ============================================================================
# 도움말
# ============================================================================

help: ## 사용 가능한 명령어 안내
	@printf "\n"
	@printf "CardKeeper Makefile\n"
	@printf "====================\n"
	@printf "\n"
	@printf "사용법: make [target]\n"
	@printf "\n"
	@printf "  \033[1m설치 및 초기 설정\033[0m\n"
	@printf "  \033[36minstall             \033[0m 전체 의존성 설치\n"
	@printf "  \033[36msetup               \033[0m 프로젝트 초기 셋업 (신규 환경)\n"
	@printf "\n"
	@printf "  \033[1m개발 서버 실행\033[0m\n"
	@printf "  \033[36mdev                 \033[0m 전체 앱 개발 서버 (Turborepo)\n"
	@printf "  \033[36mdev-web             \033[0m 웹 앱만 실행 (Next.js, port 3000)\n"
	@printf "  \033[36mdev-web-https       \033[0m 웹 앱 HTTPS 실행 (외부 기기 테스트용)\n"
	@printf "  \033[36mdev-mobile          \033[0m 모바일 앱만 실행 (Expo)\n"
	@printf "\n"
	@printf "  \033[1m빌드 및 앱 실행\033[0m\n"
	@printf "  \033[36mbuild               \033[0m 전체 프로덕션 빌드\n"
	@printf "  \033[36mstart               \033[0m 웹 프로덕션 서버 시작 (next start)\n"
	@printf "  \033[36mbuild-ios           \033[0m iOS 앱 빌드 (EAS Build)\n"
	@printf "  \033[36mbuild-android       \033[0m Android 앱 빌드 (EAS Build)\n"
	@printf "\n"
	@printf "  \033[1m데이터베이스\033[0m\n"
	@printf "  \033[36mdb-generate         \033[0m Prisma 클라이언트 생성\n"
	@printf "  \033[36mdb-push             \033[0m DB 스키마 푸시\n"
	@printf "  \033[36mdb-migrate          \033[0m 개발 마이그레이션 실행\n"
	@printf "  \033[36mdb-migrate-deploy   \033[0m 프로덕션 마이그레이션 배포\n"
	@printf "  \033[36mdb-seed             \033[0m 시드 데이터 투입\n"
	@printf "  \033[36mdb-studio           \033[0m Prisma Studio (DB GUI)\n"
	@printf "\n"
	@printf "  \033[1m테스트\033[0m\n"
	@printf "  \033[36mtest                \033[0m 전체 단위 테스트 (Vitest)\n"
	@printf "  \033[36mtest-e2e            \033[0m E2E 테스트 (Playwright/Detox)\n"
	@printf "  \033[36mtest-load           \033[0m 부하 테스트 (k6)\n"
	@printf "\n"
	@printf "  \033[1m코드 품질\033[0m\n"
	@printf "  \033[36mlint                \033[0m ESLint 실행\n"
	@printf "  \033[36mtype-check          \033[0m TypeScript 타입 체크\n"
	@printf "  \033[36mformat              \033[0m Prettier 포맷팅\n"
	@printf "  \033[36mformat-check        \033[0m 포맷 검사만\n"
	@printf "  \033[36mcheck               \033[0m CI와 동일한 전체 검사\n"
	@printf "\n"
	@printf "  \033[1m정리\033[0m\n"
	@printf "  \033[36mclean               \033[0m 빌드 캐시 및 의존성 정리\n"
	@printf "\n"
