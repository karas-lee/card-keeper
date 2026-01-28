"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OcrResultForm } from "@/components/scan/ocr-result-form";
import { useConfirmScan } from "@/hooks/use-scan";
import type { ScanConfirmInput } from "@cardkeeper/shared-utils";

interface ScanData {
  scanId: string;
  imageUrl: string;
  ocrResult: {
    rawText: string;
    confidence: number;
    parsed: {
      name: string | null;
      company: string | null;
      jobTitle: string | null;
      contactDetails: Array<{
        type: string;
        value: string;
      }>;
      address: string | null;
      website: string | null;
    };
  };
}

export default function ScanConfirmPage() {
  const confirmScan = useConfirmScan();
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("cardkeeper-scan-data");
      if (stored) {
        const parsed = JSON.parse(stored) as ScanData;
        setScanData(parsed);
      } else {
        setError("스캔 데이터를 찾을 수 없습니다. 다시 스캔해주세요.");
      }
    } catch {
      setError("스캔 데이터를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = (data: ScanConfirmInput) => {
    confirmScan.mutate(data, {
      onSuccess: () => {
        // Clean up stored scan data after successful save
        sessionStorage.removeItem("cardkeeper-scan-data");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !scanData) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <ScanLine className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            스캔 데이터 없음
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            {error || "스캔 데이터를 찾을 수 없습니다. 다시 스캔해주세요."}
          </p>
          <Button asChild>
            <Link href="/scan">다시 스캔하기</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScanLine className="h-7 w-7 text-primary-600" />
          <h1 className="text-2xl font-semibold text-gray-900">
            스캔 결과 확인
          </h1>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/scan" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            다시 스캔하기
          </Link>
        </Button>
      </div>

      {/* OCR result form */}
      <OcrResultForm
        scanData={scanData}
        onSubmit={handleSubmit}
        isLoading={confirmScan.isPending}
      />
    </div>
  );
}
