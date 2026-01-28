"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";

const API_BASE = "/api/v1";

export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
}

async function fetchWithAuth(url: string, token: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "요청에 실패했습니다");
  }
  if (res.status === 204) return null;
  return res.json();
}

export function useTags() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: async () => {
      const result = await fetchWithAuth(`${API_BASE}/tags`, accessToken!);
      return result.data;
    },
    enabled: !!accessToken,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateTag() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; color?: string }) => {
      const result = await fetchWithAuth(`${API_BASE}/tags`, accessToken!, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("태그가 생성되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateTag() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      color?: string;
    }) => {
      const result = await fetchWithAuth(
        `${API_BASE}/tags/${id}`,
        accessToken!,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("태그가 수정되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteTag() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchWithAuth(`${API_BASE}/tags/${id}`, accessToken!, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("태그가 삭제되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
