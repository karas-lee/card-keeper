"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileDown,
  FileSpreadsheet,
  ContactRound,
  ChevronRight,
  ChevronLeft,
  Check,
  FolderOpen,
  Tag,
  Users,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useExportVCard, useExportCsv } from "@/hooks/use-export";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

type ExportFormat = "vcard3" | "vcard4" | "csv";
type ExportScope = "all" | "selected" | "folder" | "tag";

interface FolderOption {
  id: string;
  name: string;
}

interface TagOption {
  id: string;
  name: string;
}

const FORMAT_OPTIONS: {
  value: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "vcard3",
    label: "vCard 3.0",
    description: "대부분의 연락처 앱과 호환",
    icon: <ContactRound className="h-6 w-6" />,
  },
  {
    value: "vcard4",
    label: "vCard 4.0",
    description: "최신 표준, 더 많은 필드 지원",
    icon: <ContactRound className="h-6 w-6" />,
  },
  {
    value: "csv",
    label: "CSV",
    description: "엑셀, 구글 시트에서 열기 가능",
    icon: <FileSpreadsheet className="h-6 w-6" />,
  },
];

const SCOPE_OPTIONS: {
  value: ExportScope;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "all",
    label: "전체 명함",
    description: "모든 명함을 내보냅니다",
    icon: <Users className="h-5 w-5" />,
  },
  {
    value: "selected",
    label: "선택한 명함",
    description: "선택한 명함만 내보냅니다",
    icon: <ListChecks className="h-5 w-5" />,
  },
  {
    value: "folder",
    label: "폴더별",
    description: "특정 폴더의 명함을 내보냅니다",
    icon: <FolderOpen className="h-5 w-5" />,
  },
  {
    value: "tag",
    label: "태그별",
    description: "특정 태그의 명함을 내보냅니다",
    icon: <Tag className="h-5 w-5" />,
  },
];

function StepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
              i < currentStep
                ? "bg-primary-500 text-white"
                : i === currentStep
                  ? "bg-primary-500 text-white"
                  : "bg-gray-200 text-gray-500",
            )}
          >
            {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div
              className={cn(
                "h-0.5 w-8 transition-colors",
                i < currentStep ? "bg-primary-500" : "bg-gray-200",
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function ExportWizard() {
  const [step, setStep] = useState(0);
  const [format, setFormat] = useState<ExportFormat>("vcard3");
  const [scope, setScope] = useState<ExportScope>("all");
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [selectedTagId, setSelectedTagId] = useState<string>("");

  const exportVCard = useExportVCard();
  const exportCsv = useExportCsv();
  const { accessToken } = useAuthStore();

  const needsSelection = scope === "folder" || scope === "tag";
  const totalSteps = needsSelection ? 4 : 3;

  // Fetch folders
  const { data: foldersData } = useQuery<{ data: FolderOption[] }>({
    queryKey: ["folders"],
    queryFn: async () => {
      const res = await fetch("/api/v1/folders", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("폴더 목록을 불러오지 못했습니다");
      return res.json();
    },
    enabled: scope === "folder",
  });

  // Fetch tags
  const { data: tagsData } = useQuery<{ data: TagOption[] }>({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await fetch("/api/v1/tags", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("태그 목록을 불러오지 못했습니다");
      return res.json();
    },
    enabled: scope === "tag",
  });

  const folders = foldersData?.data ?? [];
  const tags = tagsData?.data ?? [];

  const canProceed = () => {
    if (step === 0) return !!format;
    if (step === 1) return !!scope;
    if (step === 2 && needsSelection) {
      if (scope === "folder") return !!selectedFolderId;
      if (scope === "tag") return !!selectedTagId;
    }
    return true;
  };

  const handleExport = () => {
    const params: any = { scope };

    if (scope === "folder") params.folderId = selectedFolderId;
    if (scope === "tag") params.tagId = selectedTagId;

    if (format === "csv") {
      exportCsv.mutate(params);
    } else {
      params.version = format === "vcard4" ? "4.0" : "3.0";
      exportVCard.mutate(params);
    }
  };

  const isExporting = exportVCard.isPending || exportCsv.isPending;

  const handleNext = () => {
    if (step === totalSteps - 1) {
      handleExport();
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  const renderStep = () => {
    // Step 0: Format selection
    if (step === 0) {
      return (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            내보내기 형식 선택
          </h3>
          <div className="grid gap-3">
            {FORMAT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFormat(opt.value)}
                className={cn(
                  "flex items-center gap-4 rounded-lg border-2 p-4 text-left transition-colors",
                  format === opt.value
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300",
                )}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-lg",
                    format === opt.value
                      ? "bg-primary-100 text-primary-600"
                      : "bg-gray-100 text-gray-500",
                  )}
                >
                  {opt.icon}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{opt.label}</div>
                  <div className="text-sm text-gray-500">
                    {opt.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Step 1: Scope selection
    if (step === 1) {
      return (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            내보내기 범위 선택
          </h3>
          <div className="grid gap-3">
            {SCOPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setScope(opt.value);
                  setSelectedFolderId("");
                  setSelectedTagId("");
                }}
                className={cn(
                  "flex items-center gap-4 rounded-lg border-2 p-4 text-left transition-colors",
                  scope === opt.value
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    scope === opt.value
                      ? "bg-primary-100 text-primary-600"
                      : "bg-gray-100 text-gray-500",
                  )}
                >
                  {opt.icon}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{opt.label}</div>
                  <div className="text-sm text-gray-500">
                    {opt.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Step 2 (when needsSelection): Folder/tag picker
    if (step === 2 && needsSelection) {
      if (scope === "folder") {
        return (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              폴더 선택
            </h3>
            {folders.length === 0 ? (
              <p className="text-sm text-gray-500">
                생성된 폴더가 없습니다.
              </p>
            ) : (
              <div className="grid gap-2">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-colors",
                      selectedFolderId === folder.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <FolderOpen className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {folder.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      }

      return (
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            태그 선택
          </h3>
          {tags.length === 0 ? (
            <p className="text-sm text-gray-500">생성된 태그가 없습니다.</p>
          ) : (
            <div className="grid gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTagId(tag.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-colors",
                    selectedTagId === tag.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <Tag className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-900">{tag.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Final step: Confirmation
    const formatLabel =
      FORMAT_OPTIONS.find((o) => o.value === format)?.label ?? format;
    const scopeLabel =
      SCOPE_OPTIONS.find((o) => o.value === scope)?.label ?? scope;
    const selectionLabel =
      scope === "folder"
        ? folders.find((f) => f.id === selectedFolderId)?.name
        : scope === "tag"
          ? tags.find((t) => t.id === selectedTagId)?.name
          : null;

    return (
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          내보내기 확인
        </h3>
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">형식</span>
              <span className="text-sm font-medium text-gray-900">
                {formatLabel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">범위</span>
              <span className="text-sm font-medium text-gray-900">
                {scopeLabel}
              </span>
            </div>
            {selectionLabel && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">
                  {scope === "folder" ? "폴더" : "태그"}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {selectionLabel}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
        <p className="mt-4 text-sm text-gray-500">
          위 설정으로 명함 데이터를 내보냅니다. 내보내기 버튼을 클릭하면
          파일이 자동으로 다운로드됩니다.
        </p>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-lg">
      <StepIndicator currentStep={step} totalSteps={totalSteps} />
      <div className="mb-8">{renderStep()}</div>
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          이전
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed() || isExporting}
        >
          {step === totalSteps - 1 ? (
            <>
              <FileDown className="mr-1 h-4 w-4" />
              {isExporting ? "내보내는 중..." : "내보내기"}
            </>
          ) : (
            <>
              다음
              <ChevronRight className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
