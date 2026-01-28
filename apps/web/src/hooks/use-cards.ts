"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import type {
  CardListParams,
  CardSummary,
  CardDetail,
  PaginatedResponse,
  ApiResponse,
} from "@cardkeeper/shared-types";
import type {
  CreateCardInput,
  UpdateCardInput,
} from "@cardkeeper/shared-utils";

const API_BASE = "/api/v1";

async function fetchWithAuth<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody?.error?.message || `요청에 실패했습니다 (${response.status})`;
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

// Query keys
export const cardKeys = {
  all: ["cards"] as const,
  lists: () => [...cardKeys.all, "list"] as const,
  list: (params: CardListParams) => [...cardKeys.lists(), params] as const,
  details: () => [...cardKeys.all, "detail"] as const,
  detail: (id: string) => [...cardKeys.details(), id] as const,
};

// ---------- Queries ----------

export function useCards(params: CardListParams = {}) {
  return useInfiniteQuery<PaginatedResponse<CardSummary>>({
    queryKey: cardKeys.list(params),
    queryFn: async ({ pageParam }) => {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.set("search", params.search);
      if (params.folderId) queryParams.set("folderId", params.folderId);
      if (params.tagIds?.length)
        queryParams.set("tagIds", params.tagIds.join(","));
      if (params.tagMode) queryParams.set("tagMode", params.tagMode);
      if (params.isFavorite !== undefined)
        queryParams.set("isFavorite", String(params.isFavorite));
      if (params.company) queryParams.set("company", params.company);
      if (params.sort) queryParams.set("sort", params.sort);
      if (params.order) queryParams.set("order", params.order);
      if (params.limit) queryParams.set("limit", String(params.limit));
      if (pageParam) queryParams.set("cursor", pageParam as string);

      const qs = queryParams.toString();
      return fetchWithAuth<PaginatedResponse<CardSummary>>(
        `/cards${qs ? `?${qs}` : ""}`,
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.nextCursor : undefined,
  });
}

export function useCardDetail(id: string) {
  return useQuery<CardDetail>({
    queryKey: cardKeys.detail(id),
    queryFn: () =>
      fetchWithAuth<ApiResponse<CardDetail>>(`/cards/${id}`).then(
        (r) => r.data,
      ),
    enabled: !!id,
  });
}

// ---------- Mutations ----------

export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCardInput) =>
      fetchWithAuth<ApiResponse<CardDetail>>("/cards", {
        method: "POST",
        body: JSON.stringify(data),
      }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });
      toast.success("명함이 추가되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message || "명함 추가에 실패했습니다");
    },
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCardInput }) =>
      fetchWithAuth<ApiResponse<CardDetail>>(`/cards/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }).then((r) => r.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: cardKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });
      toast.success("명함이 수정되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message || "명함 수정에 실패했습니다");
    },
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchWithAuth<void>(`/cards/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: cardKeys.lists() });

      const previousData = queryClient.getQueriesData({
        queryKey: cardKeys.lists(),
      });

      queryClient.setQueriesData(
        { queryKey: cardKeys.lists() },
        (old: { pages: PaginatedResponse<CardSummary>[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((card) => card.id !== id),
              meta: {
                ...page.meta,
                totalCount: page.meta.totalCount - 1,
              },
            })),
          };
        },
      );

      return { previousData };
    },
    onError: (error: Error, _, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error(error.message || "명함 삭제에 실패했습니다");
    },
    onSuccess: () => {
      toast.success("명함이 삭제되었습니다");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      isFavorite,
    }: {
      id: string;
      isFavorite: boolean;
    }) =>
      fetchWithAuth<void>(`/cards/${id}/favorite`, {
        method: "PATCH",
        body: JSON.stringify({ isFavorite }),
      }),
    onMutate: async ({ id, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: cardKeys.lists() });
      await queryClient.cancelQueries({ queryKey: cardKeys.detail(id) });

      const previousDetail = queryClient.getQueryData<CardDetail>(
        cardKeys.detail(id),
      );

      queryClient.setQueryData<CardDetail>(cardKeys.detail(id), (old) =>
        old ? { ...old, isFavorite } : old,
      );

      queryClient.setQueriesData(
        { queryKey: cardKeys.lists() },
        (old: { pages: PaginatedResponse<CardSummary>[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((card) =>
                card.id === id ? { ...card, isFavorite } : card,
              ),
            })),
          };
        },
      );

      return { previousDetail };
    },
    onError: (error: Error, { id }, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(cardKeys.detail(id), context.previousDetail);
      }
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });
      toast.error("즐겨찾기 변경에 실패했습니다");
    },
  });
}

export function useMoveToFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      folderId,
    }: {
      id: string;
      folderId: string | null;
    }) =>
      fetchWithAuth<void>(`/cards/${id}/folder`, {
        method: "PATCH",
        body: JSON.stringify({ folderId }),
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: cardKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });
      toast.success("폴더가 변경되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message || "폴더 변경에 실패했습니다");
    },
  });
}

export function useAddTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tagId }: { id: string; tagId: string }) =>
      fetchWithAuth<void>(`/cards/${id}/tags`, {
        method: "POST",
        body: JSON.stringify({ tagId }),
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: cardKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });
      toast.success("태그가 추가되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message || "태그 추가에 실패했습니다");
    },
  });
}

export function useRemoveTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tagId }: { id: string; tagId: string }) =>
      fetchWithAuth<void>(`/cards/${id}/tags/${tagId}`, {
        method: "DELETE",
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: cardKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });
      toast.success("태그가 제거되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message || "태그 제거에 실패했습니다");
    },
  });
}

export function useBatchDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cardIds: string[]) =>
      fetchWithAuth<void>("/cards/batch/delete", {
        method: "POST",
        body: JSON.stringify({ cardIds }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });
      toast.success("선택한 명함이 삭제되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message || "명함 일괄 삭제에 실패했습니다");
    },
  });
}

export function useBatchMove() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cardIds,
      folderId,
    }: {
      cardIds: string[];
      folderId: string | null;
    }) =>
      fetchWithAuth<void>("/cards/batch/move", {
        method: "POST",
        body: JSON.stringify({ cardIds, folderId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });
      toast.success("선택한 명함의 폴더가 변경되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message || "폴더 일괄 이동에 실패했습니다");
    },
  });
}

export function useBatchTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cardIds,
      tagIds,
      action,
    }: {
      cardIds: string[];
      tagIds: string[];
      action: "add" | "remove";
    }) =>
      fetchWithAuth<void>("/cards/batch/tag", {
        method: "POST",
        body: JSON.stringify({ cardIds, tagIds, action }),
      }),
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });
      toast.success(
        action === "add"
          ? "태그가 일괄 추가되었습니다"
          : "태그가 일괄 제거되었습니다",
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "태그 일괄 처리에 실패했습니다");
    },
  });
}
