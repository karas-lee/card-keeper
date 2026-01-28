"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import type { CardDetail, ApiResponse } from "@cardkeeper/shared-types";

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

/**
 * 단일 명함 상세 조회 훅
 *
 * @param cardId - 조회할 명함 ID
 * @returns { card, isLoading, error, refetch }
 */
export function useCardDetail(cardId: string) {
  const { data, isLoading, error, refetch } = useQuery<CardDetail>({
    queryKey: ["cards", cardId],
    queryFn: () =>
      fetchWithAuth<ApiResponse<CardDetail>>(`/cards/${cardId}`).then(
        (r) => r.data,
      ),
    enabled: !!cardId,
  });

  return {
    card: data ?? null,
    isLoading,
    error,
    refetch,
  };
}
