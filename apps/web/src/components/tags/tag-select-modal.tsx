"use client";

import { useState } from "react";
import { useTags, useCreateTag, type Tag } from "@/hooks/use-tags";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";

interface TagSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSelect: (tagIds: string[]) => void;
}

export function TagSelectModal({
  open,
  onOpenChange,
  selectedIds,
  onSelect,
}: TagSelectModalProps) {
  const { data: tags, isLoading } = useTags();
  const createTag = useCreateTag();

  const [localSelected, setLocalSelected] = useState<string[]>(selectedIds);
  const [newTagName, setNewTagName] = useState("");
  const [showNewTagInput, setShowNewTagInput] = useState(false);

  // Sync local state when dialog opens
  function handleOpenChange(value: boolean) {
    if (value) {
      setLocalSelected(selectedIds);
      setShowNewTagInput(false);
      setNewTagName("");
    }
    onOpenChange(value);
  }

  function handleToggle(tagId: string) {
    setLocalSelected((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }

  function handleConfirm() {
    onSelect(localSelected);
    onOpenChange(false);
  }

  async function handleCreateTag() {
    if (!newTagName.trim()) return;
    try {
      const newTag = await createTag.mutateAsync({ name: newTagName.trim() });
      setLocalSelected((prev) => [...prev, newTag.id]);
      setNewTagName("");
      setShowNewTagInput(false);
    } catch {
      // Error is handled by the hook toast
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>태그 선택</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[320px]">
              <div className="space-y-1 p-1">
                {(tags || []).map((tag) => (
                  <label
                    key={tag.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100",
                      localSelected.includes(tag.id) && "bg-primary-50"
                    )}
                  >
                    <Checkbox
                      checked={localSelected.includes(tag.id)}
                      onCheckedChange={() => handleToggle(tag.id)}
                    />
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1">{tag.name}</span>
                    <span className="text-xs text-gray-400">
                      {tag.cardCount}
                    </span>
                  </label>
                ))}

                {(!tags || tags.length === 0) && !showNewTagInput && (
                  <p className="py-4 text-center text-sm text-gray-500">
                    생성된 태그가 없습니다
                  </p>
                )}
              </div>
            </ScrollArea>

            {/* Inline create new tag */}
            {showNewTagInput ? (
              <div className="flex items-center gap-2 px-1">
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="새 태그 이름"
                  className="h-8 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateTag();
                    }
                    if (e.key === "Escape") {
                      setShowNewTagInput(false);
                      setNewTagName("");
                    }
                  }}
                  autoFocus
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateTag}
                  disabled={createTag.isPending || !newTagName.trim()}
                >
                  {createTag.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    "추가"
                  )}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-start text-gray-500"
                onClick={() => setShowNewTagInput(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                새 태그 만들기
              </Button>
            )}
          </>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button type="button" onClick={handleConfirm}>
            선택 완료
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
