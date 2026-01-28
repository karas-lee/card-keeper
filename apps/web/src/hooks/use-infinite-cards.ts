"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { useMemo } from "react";
import type {
  CardListParams,
  CardSummary,
  PaginatedResponse,
} from "@cardkeeper/shared-types";

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

export interface UseInfiniteCardsParams {
  /** 검색어 (이름, 회사, 전화번호 등) */
  search?: string;
  /** 폴더 필터 */
  folderId?: string;
  /** 태그 필터 (다중) */
  tagIds?: string[];
  /** 태그 필터 모드 */
  tagMode?: "AND" | "OR";
  /** 날짜 범위 시작 (ISO 문자열) */
  startDate?: string;
  /** 날짜 범위 종료 (ISO 문자열) */
  endDate?: string;
  /** 즐겨찾기 필터 */
  isFavorite?: boolean;
  /** 회사 필터 */
  company?: string;
  /** 정렬 기준 */
  sort?: "name" | "createdAt" | "updatedAt" | "company";
  /** 정렬 방향 */
  order?: "asc" | "desc";
  /** 페이지당 항목 수 */
  limit?: number;
}

function buildQueryParams(
  params: UseInfiniteCardsParams,
  cursor?: string,
): string {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.set("search", params.search);
  if (params.folderId) queryParams.set("folderId", params.folderId);
  if (params.tagIds?.length)
    queryParams.set("tagIds", params.tagIds.join(","));
  if (params.tagMode) queryParams.set("tagMode", params.tagMode);
  if (params.isFavorite !== undefined)
    queryParams.set("isFavorite", String(params.isFavorite));
  if (params.company) queryParams.set("company", params.company);
  if (params.startDate) queryParams.set("startDate", params.startDate);
  if (params.endDate) queryParams.set("endDate", params.endDate);
  if (params.sort) queryParams.set("sort", params.sort);
  if (params.order) queryParams.set("order", params.order);
  if (params.limit) queryParams.set("limit", String(params.limit));
  if (cursor) queryParams.set("cursor", cursor);

  const qs = queryParams.toString();
  return qs ? `?${qs}` : "";
}

/**
 * 커서 기반 무한 스크롤 명함 목록 훅
 *
 * 검색, 폴더/태그 필터, 날짜 범위를 지원하며
 * 페이지네이션된 응답을 flat 배열로 반환합니다.
 */
export function useInfiniteCards(params: UseInfiniteCardsParams = {}) {
  const listParams: CardListParams = params;

  const query = useInfiniteQuery<PaginatedResponse<CardSummary>>({
    queryKey: ["cards", "list", listParams],
    queryFn: async ({ pageParam }) => {
      const qs = buildQueryParams(params, pageParam as string | undefined);
      return fetchWithAuth<PaginatedResponse<CardSummary>>(`/cards${qs}`);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.nextCursor : undefined,
  });

  const cards = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data],
  );

  return {
    cards,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    error: query.error,
    refetch: query.refetch,
  };
}
