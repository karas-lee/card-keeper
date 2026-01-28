"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { cardKeys } from "./use-cards";

const API_BASE = "/api/v1";

export function useUploadScan() {
  const { accessToken } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`${API_BASE}/scan/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "스캔에 실패했습니다");
      }
      return res.json();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useConfirmScan() {
  const { accessToken } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/scan/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "명함 저장에 실패했습니다");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });
      toast.success("명함이 저장되었습니다");
      router.push("/cards");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
