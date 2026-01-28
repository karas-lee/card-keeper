"use client";

import {
  LayoutGrid,
  List,
  Table,
  Star,
  ArrowUpDown,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUiStore } from "@/stores/ui.store";
import { cn } from "@/lib/utils";

interface CardFilterBarProps {
  folderId: string | undefined;
  onFolderChange: (folderId: string | undefined) => void;
  selectedTagIds: string[];
  onTagChange: (tagIds: string[]) => void;
  isFavorite: boolean | undefined;
  onFavoriteChange: (isFavorite: boolean | undefined) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  order: "asc" | "desc";
  onOrderChange: (order: "asc" | "desc") => void;
  folders?: Array<{ id: string; name: string }>;
  tags?: Array<{ id: string; name: string; color: string | null }>;
}

export function CardFilterBar({
  folderId,
  onFolderChange,
  selectedTagIds,
  onTagChange,
  isFavorite,
  onFavoriteChange,
  sort,
  onSortChange,
  order,
  onOrderChange,
  folders = [],
  tags = [],
}: CardFilterBarProps) {
  const { viewMode, setViewMode } = useUiStore();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Folder filter */}
      <Select
        value={folderId ?? "all"}
        onValueChange={(val: string) =>
          onFolderChange(val === "all" ? undefined : val)
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="모든 폴더" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모든 폴더</SelectItem>
          {folders.map((folder) => (
            <SelectItem key={folder.id} value={folder.id}>
              {folder.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Tag filter */}
      <Select
        value={selectedTagIds[0] ?? "all"}
        onValueChange={(val: string) =>
          onTagChange(val === "all" ? [] : [val])
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="태그 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모든 태그</SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag.id} value={tag.id}>
              <span className="flex items-center gap-2">
                {tag.color && (
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                )}
                {tag.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Favorite toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isFavorite ? "default" : "outline"}
            size="icon"
            onClick={() =>
              onFavoriteChange(isFavorite ? undefined : true)
            }
          >
            <Star
              className={cn(
                "h-4 w-4",
                isFavorite && "fill-current",
              )}
            />
            <span className="sr-only">즐겨찾기 필터</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>즐겨찾기만 보기</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Sort */}
      <Select value={sort} onValueChange={onSortChange}>
        <SelectTrigger className="w-[130px]">
          <ArrowUpDown className="mr-1 h-3.5 w-3.5" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">등록일</SelectItem>
          <SelectItem value="updatedAt">수정일</SelectItem>
          <SelectItem value="name">이름</SelectItem>
          <SelectItem value="company">회사</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort order */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              onOrderChange(order === "asc" ? "desc" : "asc")
            }
          >
            {order === "asc" ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
            <span className="sr-only">정렬 순서</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {order === "asc" ? "오름차순" : "내림차순"}
        </TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* View mode toggle */}
      <div className="flex items-center rounded-md border border-gray-200">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-none rounded-l-md"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">그리드 보기</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>그리드 보기</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">리스트 보기</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>리스트 보기</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-none rounded-r-md"
              onClick={() => setViewMode("table")}
            >
              <Table className="h-4 w-4" />
              <span className="sr-only">테이블 보기</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>테이블 보기</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
