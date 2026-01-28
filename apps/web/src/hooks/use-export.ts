"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";

const API_BASE = "/api/v1";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function useExportVCard() {
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: async (params: any) => {
      const res = await fetch(`${API_BASE}/export/vcard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("내보내기에 실패했습니다");
      return res.blob();
    },
    onSuccess: (blob) => {
      downloadBlob(
        blob,
        `cardkeeper_${new Date().toISOString().split("T")[0]}.vcf`,
      );
      toast.success("vCard 파일이 다운로드되었습니다");
    },
    onError: () => toast.error("내보내기에 실패했습니다"),
  });
}

export function useExportCsv() {
  const { accessToken } = useAuthStore();

  return useMutation({
    mutationFn: async (params: any) => {
      const res = await fetch(`${API_BASE}/export/csv`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("내보내기에 실패했습니다");
      return res.blob();
    },
    onSuccess: (blob) => {
      downloadBlob(
        blob,
        `cardkeeper_${new Date().toISOString().split("T")[0]}.csv`,
      );
      toast.success("CSV 파일이 다운로드되었습니다");
    },
    onError: () => toast.error("내보내기에 실패했습니다"),
  });
}
