"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CONFIG, LIMITS } from "@cardkeeper/shared-constants";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

const ACCEPT_TYPES = CONFIG.SUPPORTED_IMAGE_TYPES.join(",");
const MAX_SIZE = LIMITS.MAX_IMAGE_SIZE;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function FileUploadZone({ onFileSelect, isLoading }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    const supportedTypes = CONFIG.SUPPORTED_IMAGE_TYPES as readonly string[];
    if (!supportedTypes.includes(file.type)) {
      return `지원하지 않는 파일 형식입니다. (${CONFIG.SUPPORTED_IMAGE_EXTENSIONS.join(", ")})`;
    }
    if (file.size > MAX_SIZE) {
      return `파일 크기가 너무 큽니다. (최대 ${formatFileSize(MAX_SIZE)})`;
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      onFileSelect(file);
    },
    [onFileSelect, validateFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input so the same file can be re-selected
      e.target.value = "";
    },
    [handleFile],
  );

  const handleClear = useCallback(() => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
  }, []);

  return (
    <div className="space-y-4">
      {preview && selectedFile ? (
        <div className="relative rounded-lg border border-gray-200 bg-white p-4">
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="absolute right-2 top-2 rounded-full bg-gray-100 p-1 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50"
            aria-label="파일 제거"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-4">
            <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
              <img
                src={preview}
                alt="업로드된 명함 미리보기"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {selectedFile.name}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 transition-colors",
            isDragOver
              ? "border-primary-500 bg-primary-50"
              : "border-gray-300 bg-white hover:border-primary-400 hover:bg-gray-50",
            isLoading && "pointer-events-none opacity-50",
          )}
        >
          <div
            className={cn(
              "mb-4 rounded-full p-3",
              isDragOver ? "bg-primary-100" : "bg-gray-100",
            )}
          >
            <Upload
              className={cn(
                "h-8 w-8",
                isDragOver ? "text-primary-600" : "text-gray-400",
              )}
            />
          </div>
          <p className="text-sm font-medium text-gray-700">
            이미지를 드래그하거나 클릭하여 업로드
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {CONFIG.SUPPORTED_IMAGE_EXTENSIONS.join(", ")} (최대{" "}
            {formatFileSize(MAX_SIZE)})
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_TYPES}
        onChange={handleInputChange}
        className="hidden"
        aria-label="명함 이미지 선택"
      />
    </div>
  );
}
