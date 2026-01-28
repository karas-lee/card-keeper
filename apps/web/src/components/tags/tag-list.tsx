"use client";

import { useTags, type Tag } from "@/hooks/use-tags";
import { TagBadge } from "./tag-badge";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { EmptyState } from "@/components/common/empty-state";
import { Tags } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TagListProps {
  onTagClick?: (tag: Tag) => void;
  onEdit?: (tag: Tag) => void;
  onDelete?: (tag: Tag) => void;
}

export function TagList({ onTagClick, onEdit, onDelete }: TagListProps) {
  const { data: tags, isLoading, error } = useTags();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <p className="py-4 text-center text-sm text-red-500">
        태그를 불러오는데 실패했습니다
      </p>
    );
  }

  if (!tags || tags.length === 0) {
    return (
      <EmptyState
        icon={Tags}
        title="태그가 없습니다"
        description="새 태그를 만들어 명함을 분류하세요"
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="group flex items-center justify-between rounded-lg border bg-white p-3 transition-colors hover:bg-gray-50 cursor-pointer"
          onClick={() => onTagClick?.(tag)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onTagClick?.(tag);
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="h-4 w-4 shrink-0 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
            <span className="text-sm font-medium text-gray-900">
              {tag.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-normal">
              {tag.cardCount}
            </Badge>

            {/* Edit/Delete shown on hover */}
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(tag);
                }}
                aria-label="수정"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </button>
              <button
                type="button"
                className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(tag);
                }}
                aria-label="삭제"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
