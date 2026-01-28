# 05. 상태관리 & 데이터 패칭

---

## 1. 아키텍처 개요

```
┌─────────────────────────────────────────────────┐
│                  UI Layer                        │
│          (React Components)                      │
│                                                  │
│  ┌───────────┐    ┌──────────────────────────┐  │
│  │  Zustand   │    │  TanStack Query          │  │
│  │  Stores    │    │  (Server State Cache)    │  │
│  │            │    │                          │  │
│  │ • authStore│    │ • useQuery (GET)         │  │
│  │ • uiStore  │    │ • useMutation (POST/PUT) │  │
│  │ • cardList │    │ • useInfiniteQuery       │  │
│  │   Store    │    │ • Optimistic Updates     │  │
│  │ • draft    │    │                          │  │
│  │   Store    │    │                          │  │
│  └───────────┘    └────────────┬─────────────┘  │
└─────────────────────────────────┼────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │     API Client              │
                    │  (@cardkeeper/api-client)   │
                    │                             │
                    │  fetch → /api/v1/*          │
                    └─────────────────────────────┘
```

**역할 분담:**
- **Zustand:** UI 상태, 인증 상태, Draft 등 클라이언트 전용 상태
- **TanStack Query:** 서버 데이터 캐시, 데이터 패칭, Mutation, 캐시 무효화

---

## 2. Zustand 스토어 설계

### 2.1 `authStore`

```typescript
// packages/shared-types/src/stores.ts 에서 인터페이스 정의
// 실제 구현은 apps/web 또는 apps/mobile에서

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

// 웹: zustand + localStorage persist
// 모바일: zustand + MMKV persist

const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return get().logout();
        try {
          const response = await apiClient.auth.refresh({ refreshToken });
          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: "auth-storage",
      // 웹: localStorage, 모바일: MMKV
      storage: createJSONStorage(() => platformStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
```

### 2.2 `uiStore`

```typescript
interface UIState {
  // 명함 목록 뷰 모드
  cardViewMode: "card" | "list" | "table"; // 웹만 table 지원
  // 사이드바 상태 (웹)
  sidebarOpen: boolean;
  // 다중 선택 모드
  selectionMode: boolean;
  selectedCardIds: Set<string>;
  // 검색
  searchQuery: string;
  recentSearches: string[];
  // 필터
  activeFilters: {
    folderId: string | null;
    tagIds: string[];
    tagMode: "AND" | "OR";
    isFavorite: boolean | null;
    startDate: Date | null;
    endDate: Date | null;
    company: string | null;
  };
  // 정렬
  sortBy: "name" | "createdAt" | "updatedAt" | "company";
  sortOrder: "asc" | "desc";
}

interface UIActions {
  setCardViewMode: (mode: UIState["cardViewMode"]) => void;
  toggleSidebar: () => void;
  // 선택
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  toggleCardSelection: (cardId: string) => void;
  selectAll: (cardIds: string[]) => void;
  clearSelection: () => void;
  // 검색
  setSearchQuery: (query: string) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  // 필터
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  // 정렬
  setSortBy: (sort: UIState["sortBy"]) => void;
  setSortOrder: (order: UIState["sortOrder"]) => void;
}
```

### 2.3 `cardListStore`

> 카드 목록에 특화된 상태 (무한 스크롤, 선택 등)

```typescript
interface CardListState {
  // 무한 스크롤 상태
  hasNextPage: boolean;
  // 최근 추가/삭제된 카드 ID (애니메이션용)
  recentlyAddedId: string | null;
  recentlyDeletedIds: string[];
}
```

### 2.4 `draftStore`

```typescript
interface DraftState {
  // 수동 입력 Draft
  newCardDraft: Partial<CardFormData> | null;
  // OCR 결과 편집 Draft
  scanDraft: {
    scanId: string;
    data: Partial<CardFormData>;
  } | null;
  // Draft 타임스탬프
  lastSavedAt: Date | null;
}

interface DraftActions {
  setNewCardDraft: (data: Partial<CardFormData>) => void;
  clearNewCardDraft: () => void;
  setScanDraft: (scanId: string, data: Partial<CardFormData>) => void;
  clearScanDraft: () => void;
}

// persist 설정:
// 웹: localStorage (3초 debounce로 저장)
// 모바일: MMKV
```

---

## 3. TanStack Query 설정

### 3.1 QueryClient 설정

```typescript
// apps/web/src/lib/query-client.ts (웹)
// apps/mobile/src/lib/query-client.ts (모바일)

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5분 (데이터가 신선한 것으로 간주하는 시간)
      gcTime: 30 * 60 * 1000,        // 30분 (가비지 컬렉션 시간, 구 cacheTime)
      retry: 2,                       // 재시도 2회
      retryDelay: (attemptIndex) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,     // 탭 포커스 시 재패칭
      refetchOnReconnect: true,       // 네트워크 복구 시 재패칭
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### 3.2 staleTime / gcTime 엔드포인트별 설정

| 데이터 | staleTime | gcTime | 근거 |
|--------|-----------|--------|------|
| 명함 목록 | 5분 | 30분 | 자주 변경될 수 있음 |
| 명함 상세 | 5분 | 30분 | 자주 변경될 수 있음 |
| 폴더 목록 | 2분 | 60분 | 명함 생성/편집 시 실시간 반영 필요 |
| 태그 목록 | 2분 | 60분 | 명함 생성/편집 시 실시간 반영 필요 |
| 사용자 정보 | 30분 | 60분 | 거의 변경 안 됨 |
| 검색 결과 | 0 | 5분 | 항상 최신 |

---

## 4. Query Key 컨벤션

```typescript
// packages/api-client/src/query-keys.ts

export const queryKeys = {
  // 명함
  cards: {
    all: ["cards"] as const,
    lists: () => [...queryKeys.cards.all, "list"] as const,
    list: (filters: CardFilters) =>
      [...queryKeys.cards.lists(), filters] as const,
    details: () => [...queryKeys.cards.all, "detail"] as const,
    detail: (id: string) =>
      [...queryKeys.cards.details(), id] as const,
  },

  // 폴더
  folders: {
    all: ["folders"] as const,
    list: () => [...queryKeys.folders.all, "list"] as const,
    detail: (id: string) =>
      [...queryKeys.folders.all, "detail", id] as const,
  },

  // 태그
  tags: {
    all: ["tags"] as const,
    list: () => [...queryKeys.tags.all, "list"] as const,
  },

  // 사용자
  user: {
    me: ["user", "me"] as const,
  },

  // 스캔
  scan: {
    result: (scanId: string) => ["scan", scanId] as const,
  },
} as const;
```

### 4.1 Query Key 계층 구조

```
["cards"]                           → 모든 카드 관련 쿼리 무효화
["cards", "list"]                   → 모든 카드 목록 무효화
["cards", "list", { filters }]      → 특정 필터의 목록 무효화
["cards", "detail"]                 → 모든 카드 상세 무효화
["cards", "detail", "clx123"]       → 특정 카드 상세 무효화

["folders"]                         → 모든 폴더 관련 무효화
["folders", "list"]                 → 폴더 목록 무효화

["tags"]                            → 모든 태그 관련 무효화
["tags", "list"]                    → 태그 목록 무효화
```

---

## 5. Optimistic Updates

### 5.1 즐겨찾기 토글

```typescript
function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { cardId: string; isFavorite: boolean }) =>
      apiClient.cards.toggleFavorite(params.cardId, params.isFavorite),

    onMutate: async ({ cardId, isFavorite }) => {
      // 1. 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: queryKeys.cards.all });

      // 2. 이전 데이터 스냅샷
      const previousCards = queryClient.getQueriesData({
        queryKey: queryKeys.cards.lists(),
      });
      const previousDetail = queryClient.getQueryData(
        queryKeys.cards.detail(cardId)
      );

      // 3. Optimistic Update
      queryClient.setQueriesData(
        { queryKey: queryKeys.cards.lists() },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data.map((card: any) =>
                card.id === cardId
                  ? { ...card, isFavorite }
                  : card
              ),
            })),
          };
        }
      );

      queryClient.setQueryData(
        queryKeys.cards.detail(cardId),
        (old: any) => old ? { ...old, isFavorite } : old
      );

      return { previousCards, previousDetail };
    },

    onError: (_err, { cardId }, context) => {
      // 4. 롤백
      if (context?.previousCards) {
        context.previousCards.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          queryKeys.cards.detail(cardId),
          context.previousDetail
        );
      }
    },

    onSettled: () => {
      // 5. 확정 (서버 데이터로 동기화)
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
    },
  });
}
```

### 5.2 삭제

```typescript
function useDeleteCard() {
  return useMutation({
    mutationFn: (cardId: string) => apiClient.cards.delete(cardId),

    onMutate: async (cardId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cards.all });

      const previousCards = queryClient.getQueriesData({
        queryKey: queryKeys.cards.lists(),
      });

      // Optimistic: 목록에서 제거
      queryClient.setQueriesData(
        { queryKey: queryKeys.cards.lists() },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data.filter((card: any) => card.id !== cardId),
              meta: {
                ...page.meta,
                totalCount: page.meta.totalCount - 1,
              },
            })),
          };
        }
      );

      return { previousCards };
    },

    onError: (_err, _cardId, context) => {
      if (context?.previousCards) {
        context.previousCards.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all }); // 카운트 갱신
    },
  });
}
```

### 5.3 태그 추가/제거

```typescript
// Optimistic: 카드의 tags 배열에 즉시 추가/제거
// 롤백: 이전 상태 복원
// 확정: cards.all + tags.all 무효화
```

### 5.4 폴더 이동

```typescript
// Optimistic: 카드의 folder 정보 즉시 업데이트
// 이전 폴더/새 폴더의 cardCount 갱신
// 확정: cards.all + folders.all 무효화
```

---

## 6. 캐시 무효화 전략

| Mutation 액션 | 무효화 대상 |
|--------------|------------|
| 명함 생성 | `cards.lists()`, `folders.all` (카운트) |
| 명함 수정 | `cards.detail(id)`, `cards.lists()` |
| 명함 삭제 | `cards.all`, `folders.all`, `tags.all` |
| 즐겨찾기 토글 | `cards.all` |
| 폴더 이동 | `cards.all`, `folders.all` |
| 태그 추가/제거 | `cards.detail(id)`, `cards.lists()`, `tags.all` |
| 일괄 삭제 | `cards.all`, `folders.all`, `tags.all` |
| 일괄 이동 | `cards.all`, `folders.all` |
| 일괄 태그 | `cards.all`, `tags.all` |
| 폴더 CRUD | `folders.all` |
| 태그 CRUD | `tags.all` |
| OCR 저장 | `cards.lists()`, `folders.all` |

---

## 7. API Client

> 상세는 `06-shared-packages.md`의 api-client 섹션 참조

### 7.1 엔드포인트 개요

```typescript
// packages/api-client/src/index.ts

class ApiClient {
  auth: {
    register(data: RegisterRequest): Promise<AuthResponse>;
    login(data: LoginRequest): Promise<AuthResponse>;
    logout(): Promise<void>;
    refresh(data: RefreshRequest): Promise<TokenResponse>;
    forgotPassword(data: ForgotPasswordRequest): Promise<void>;
    resetPassword(data: ResetPasswordRequest): Promise<void>;
    verifyEmail(token: string): Promise<void>;
    getMe(): Promise<User>;
  };

  cards: {
    list(params: CardListParams): Promise<PaginatedResponse<CardSummary>>;
    get(id: string): Promise<CardDetail>;
    create(data: CreateCardRequest): Promise<CardDetail>;
    update(id: string, data: UpdateCardRequest): Promise<CardDetail>;
    delete(id: string): Promise<void>;
    toggleFavorite(id: string, isFavorite: boolean): Promise<void>;
    moveToFolder(id: string, folderId: string | null): Promise<void>;
    addTag(id: string, tagId: string): Promise<void>;
    removeTag(id: string, tagId: string): Promise<void>;
    batchDelete(cardIds: string[]): Promise<void>;
    batchMove(cardIds: string[], folderId: string | null): Promise<void>;
    batchTag(cardIds: string[], tagIds: string[], action: "add" | "remove"): Promise<void>;
  };

  scan: {
    upload(image: File | Blob): Promise<ScanUploadResponse>;
    confirm(data: ScanConfirmRequest): Promise<CardDetail>;
  };

  folders: {
    list(): Promise<FolderTree[]>;
    create(data: CreateFolderRequest): Promise<Folder>;
    update(id: string, data: UpdateFolderRequest): Promise<Folder>;
    delete(id: string): Promise<void>;
  };

  tags: {
    list(): Promise<TagWithCount[]>;
    create(data: CreateTagRequest): Promise<Tag>;
    update(id: string, data: UpdateTagRequest): Promise<Tag>;
    delete(id: string): Promise<void>;
  };

  export: {
    vcard(params: ExportParams): Promise<Blob>;
    csv(params: ExportParams): Promise<Blob>;
  };
}
```

---

**다음 문서:** [06-shared-packages.md](./06-shared-packages.md)
