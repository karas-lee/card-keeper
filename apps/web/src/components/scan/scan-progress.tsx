"use client";

import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScanProgressProps {
  currentStep: number; // 0-2
}

const STEPS = [
  { label: "이미지 업로드", description: "이미지를 서버로 전송하고 있습니다" },
  { label: "OCR 분석", description: "이미지에서 텍스트를 인식하고 있습니다" },
  { label: "텍스트 파싱", description: "명함 정보를 추출하고 있습니다" },
] as const;

export function ScanProgress({ currentStep }: ScanProgressProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-6 text-center text-lg font-semibold text-gray-900">
        명함을 분석하고 있습니다
      </h3>

      <div className="space-y-4">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;

          return (
            <div
              key={step.label}
              className={cn(
                "flex items-start gap-4 rounded-lg px-4 py-3 transition-colors",
                isCurrent && "bg-primary-50",
                isCompleted && "bg-green-50",
              )}
            >
              {/* Step indicator */}
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
                {isCompleted && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
                {isCurrent && (
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                )}
                {isPending && (
                  <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                )}
              </div>

              {/* Step content */}
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCompleted && "text-green-700",
                    isCurrent && "text-primary-700",
                    isPending && "text-gray-400",
                  )}
                >
                  {step.label}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-xs",
                    isCompleted && "text-green-600",
                    isCurrent && "text-primary-600",
                    isPending && "text-gray-400",
                  )}
                >
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-primary-600 transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep + 1) / STEPS.length) * 100}%`,
            }}
          />
        </div>
        <p className="mt-2 text-center text-xs text-gray-500">
          {currentStep + 1} / {STEPS.length}
        </p>
      </div>
    </div>
  );
}
