"use client";

import { useState } from "react";
import {
  X,
  FolderInput,
  Tags,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { useUiStore } from "@/stores/ui.store";
import { useBatchDelete, useBatchMove, useBatchTag } from "@/hooks/use-cards";

interface CardSelectionBarProps {
  folders?: Array<{ id: string; name: string }>;
  tags?: Array<{ id: string; name: string; color: string | null }>;
}

export function CardSelectionBar({
  folders = [],
  tags = [],
}: CardSelectionBarProps) {
  const { selectedCardIds, clearSelection } = useUiStore();
  const batchDelete = useBatchDelete();
  const batchMove = useBatchMove();
  const batchTag = useBatchTag();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const count = selectedCardIds.length;

  if (count === 0) return null;

  const handleBatchDelete = () => {
    batchDelete.mutate(selectedCardIds, {
      onSuccess: () => {
        clearSelection();
        setShowDeleteDialog(false);
      },
    });
  };

  const handleBatchMove = (folderId: string) => {
    batchMove.mutate(
      {
        cardIds: selectedCardIds,
        folderId: folderId === "none" ? null : folderId,
      },
      {
        onSuccess: () => clearSelection(),
      },
    );
  };

  const handleBatchTag = (tagId: string) => {
    batchTag.mutate(
      {
        cardIds: selectedCardIds,
        tagIds: [tagId],
        action: "add",
      },
      {
        onSuccess: () => clearSelection(),
      },
    );
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
        {/* Count */}
        <span className="text-sm font-medium text-gray-700">
          {count}개 선택됨
        </span>

        {/* Folder move */}
        <Select onValueChange={handleBatchMove}>
          <SelectTrigger className="h-8 w-[140px]">
            <FolderInput className="mr-1 h-3.5 w-3.5" />
            <SelectValue placeholder="폴더 이동" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">폴더 없음</SelectItem>
            {folders.map((folder) => (
              <SelectItem key={folder.id} value={folder.id}>
                {folder.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tag add */}
        <Select onValueChange={handleBatchTag}>
          <SelectTrigger className="h-8 w-[140px]">
            <Tags className="mr-1 h-3.5 w-3.5" />
            <SelectValue placeholder="태그 추가" />
          </SelectTrigger>
          <SelectContent>
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

        {/* Delete */}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          삭제
        </Button>

        {/* Clear selection */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={clearSelection}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">선택 해제</span>
        </Button>
      </div>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="명함 일괄 삭제"
        description={`선택한 ${count}개의 명함을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        variant="destructive"
        onConfirm={handleBatchDelete}
        isLoading={batchDelete.isPending}
      />
    </>
  );
}
