"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { scanConfirmSchema, type ScanConfirmInput } from "@cardkeeper/shared-utils";

interface OcrResult {
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
}

interface ScanData {
  scanId: string;
  imageUrl: string;
  ocrResult: OcrResult;
}

interface OcrResultFormProps {
  scanData: ScanData;
  onSubmit: (data: ScanConfirmInput) => void;
  isLoading?: boolean;
}

const CONTACT_TYPE_OPTIONS = [
  { value: "PHONE", label: "전화" },
  { value: "EMAIL", label: "이메일" },
  { value: "MOBILE", label: "휴대폰" },
  { value: "FAX", label: "팩스" },
  { value: "OTHER", label: "기타" },
] as const;

function ConfidenceBar({ confidence }: { confidence: number }) {
  const getColor = () => {
    if (confidence < 0.5) return "bg-red-500";
    if (confidence < 0.8) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getLabel = () => {
    if (confidence < 0.5) return "낮음";
    if (confidence < 0.8) return "보통";
    return "높음";
  };

  const getTextColor = () => {
    if (confidence < 0.5) return "text-red-700";
    if (confidence < 0.8) return "text-yellow-700";
    return "text-green-700";
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500">OCR 인식률</span>
      <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
        <div
          className={cn("h-full rounded-full transition-all", getColor())}
          style={{ width: `${Math.round(confidence * 100)}%` }}
        />
      </div>
      <span className={cn("text-xs font-medium", getTextColor())}>
        {Math.round(confidence * 100)}% ({getLabel()})
      </span>
    </div>
  );
}

export function OcrResultForm({
  scanData,
  onSubmit,
  isLoading,
}: OcrResultFormProps) {
  const [showRawText, setShowRawText] = useState(false);

  const { ocrResult } = scanData;
  const { parsed } = ocrResult;

  const form = useForm<ScanConfirmInput>({
    resolver: zodResolver(scanConfirmSchema),
    defaultValues: {
      scanId: scanData.scanId,
      name: parsed.name || "",
      company: parsed.company || "",
      jobTitle: parsed.jobTitle || "",
      contactDetails: parsed.contactDetails.length > 0
        ? parsed.contactDetails.map((cd) => ({
            type: cd.type as "PHONE" | "EMAIL" | "FAX" | "MOBILE" | "OTHER",
            value: cd.value,
            label: "",
            isPrimary: false,
          }))
        : [],
      address: parsed.address || "",
      website: parsed.website || "",
      memo: "",
      folderId: null,
      tagIds: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contactDetails",
  });

  const handleFormSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Confidence indicator */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <ConfidenceBar confidence={ocrResult.confidence} />
        </div>

        {/* Side-by-side layout on desktop */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Image preview */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <img
                src={scanData.imageUrl}
                alt="스캔된 명함 이미지"
                className="w-full object-contain"
              />
            </div>

            {/* Raw OCR text toggle */}
            <div className="rounded-lg border border-gray-200 bg-white">
              <button
                type="button"
                onClick={() => setShowRawText(!showRawText)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span className="flex items-center gap-2">
                  {showRawText ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  원본 텍스트 보기
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    showRawText && "rotate-180",
                  )}
                />
              </button>
              {showRawText && (
                <>
                  <Separator />
                  <div className="p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-600">
                      {ocrResult.rawText || "인식된 텍스트 없음"}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: Form fields */}
          <div className="space-y-5 rounded-lg border border-gray-200 bg-white p-5">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    이름 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="이름을 입력해주세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company */}
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>회사</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="회사명"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Job Title */}
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>직함</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="직함"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Contact Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  연락처
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    append({
                      type: "PHONE",
                      value: "",
                      label: "",
                      isPrimary: false,
                    })
                  }
                >
                  <Plus className="mr-1 h-4 w-4" />
                  추가
                </Button>
              </div>

              {fields.length === 0 && (
                <p className="py-2 text-center text-sm text-gray-400">
                  연락처가 없습니다
                </p>
              )}

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-start gap-2 rounded-md border border-gray-100 bg-gray-50 p-3"
                >
                  <FormField
                    control={form.control}
                    name={`contactDetails.${index}.type`}
                    render={({ field: typeField }) => (
                      <FormItem className="w-28 shrink-0">
                        <Select
                          value={typeField.value}
                          onValueChange={typeField.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CONTACT_TYPE_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`contactDetails.${index}.value`}
                    render={({ field: valueField }) => (
                      <FormItem className="min-w-0 flex-1">
                        <FormControl>
                          <Input
                            className="h-9"
                            placeholder="연락처 값"
                            {...valueField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-gray-400 hover:text-red-600"
                    onClick={() => remove(index)}
                    aria-label="연락처 삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Separator />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>주소</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="주소"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Website */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>웹사이트</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Memo */}
            <FormField
              control={form.control}
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>메모</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="메모를 입력해주세요"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Folder Select */}
            <FormField
              control={form.control}
              name="folderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>폴더</FormLabel>
                  <Select
                    value={field.value || "none"}
                    onValueChange={(value: string) =>
                      field.onChange(value === "none" ? null : value)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="폴더 선택 (선택사항)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">없음</SelectItem>
                      {/* Folder items are populated dynamically */}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? "저장 중..." : "명함 저장"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
