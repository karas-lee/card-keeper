"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";

const API_BASE = "/api/v1";

export interface Folder {
  id: string;
  name: string;
  color: string;
  parentId: string | null;
  order: number;
  isDefault: boolean;
  userId: string;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
  children: Folder[];
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

export function useFolders() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery<Folder[]>({
    queryKey: ["folders"],
    queryFn: async () => {
      const result = await fetchWithAuth(`${API_BASE}/folders`, accessToken!);
      return result.data;
    },
    enabled: !!accessToken,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateFolder() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      color?: string;
      parentId?: string | null;
    }) => {
      const result = await fetchWithAuth(`${API_BASE}/folders`, accessToken!, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success("폴더가 생성되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateFolder() {
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
      order?: number;
    }) => {
      const result = await fetchWithAuth(
        `${API_BASE}/folders/${id}`,
        accessToken!,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success("폴더가 수정되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteFolder() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await fetchWithAuth(`${API_BASE}/folders/${id}`, accessToken!, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success("폴더가 삭제되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
