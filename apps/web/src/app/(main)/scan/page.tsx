"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ScanLine, Upload, Camera } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploadZone } from "@/components/scan/file-upload-zone";
import { CameraCapture } from "@/components/scan/camera-capture";
import { ScanProgress } from "@/components/scan/scan-progress";
import { useUploadScan } from "@/hooks/use-scan";

export default function ScanPage() {
  const router = useRouter();
  const uploadScan = useUploadScan();
  const [scanStep, setScanStep] = useState<number | null>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setScanStep(0);

      // Simulate step progression while waiting for API
      const stepTimer1 = setTimeout(() => setScanStep(1), 800);
      const stepTimer2 = setTimeout(() => setScanStep(2), 2000);

      try {
        const result = await uploadScan.mutateAsync(file);

        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);

        // Store scan data in sessionStorage for the confirm page
        sessionStorage.setItem(
          "cardkeeper-scan-data",
          JSON.stringify(result.data ?? result),
        );

        router.push("/scan/confirm");
      } catch {
        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);
        setScanStep(null);
      }
    },
    [uploadScan, router],
  );

  const handleCapture = useCallback(
    (file: File) => {
      handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const isProcessing = scanStep !== null;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Page header */}
      <div className="mb-6 flex items-center gap-3">
        <ScanLine className="h-7 w-7 text-primary-600" />
        <h1 className="text-2xl font-semibold text-gray-900">명함 스캔</h1>
      </div>

      {isProcessing ? (
        <ScanProgress currentStep={scanStep} />
      ) : (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              파일 업로드
            </TabsTrigger>
            <TabsTrigger value="camera" className="gap-2">
              <Camera className="h-4 w-4" />
              카메라 촬영
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <FileUploadZone
              onFileSelect={handleFileSelect}
              isLoading={uploadScan.isPending}
            />
          </TabsContent>

          <TabsContent value="camera" className="mt-4">
            <CameraCapture
              onCapture={handleCapture}
              onClose={() => {
                // Reset to upload tab by doing nothing (user can switch tabs)
              }}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
