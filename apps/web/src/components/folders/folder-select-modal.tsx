"use client";

import { useFolders, type Folder } from "@/hooks/use-folders";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, FolderOpen } from "lucide-react";

interface FolderSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (folderId: string | null) => void;
  selectedId?: string | null;
}

export function FolderSelectModal({
  open,
  onOpenChange,
  onSelect,
  selectedId,
}: FolderSelectModalProps) {
  const { data: folders, isLoading } = useFolders();

  function handleSelect(folderId: string | null) {
    onSelect(folderId);
    onOpenChange(false);
  }

  // Flatten folder tree for display
  function flattenFolders(list: Folder[], level = 0): Array<Folder & { level: number }> {
    const result: Array<Folder & { level: number }> = [];
    for (const folder of list) {
      result.push({ ...folder, level });
      if (folder.children?.length) {
        result.push(...flattenFolders(folder.children, level + 1));
      }
    }
    return result;
  }

  const flatFolders = folders ? flattenFolders(folders) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>폴더 선택</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <ScrollArea className="max-h-[360px]">
            <div className="space-y-1 p-1">
              {/* No folder option */}
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100",
                  !selectedId && "bg-primary-50 text-primary-700 font-medium"
                )}
                onClick={() => handleSelect(null)}
              >
                <FolderOpen className="h-4 w-4 text-gray-400" />
                <span className="flex-1 text-left">폴더 없음</span>
                {!selectedId && (
                  <Check className="h-4 w-4 text-primary-600" />
                )}
              </button>

              {flatFolders.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100",
                    selectedId === folder.id &&
                      "bg-primary-50 text-primary-700 font-medium"
                  )}
                  style={{ paddingLeft: `${folder.level * 16 + 12}px` }}
                  onClick={() => handleSelect(folder.id)}
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: folder.color }}
                  />
                  <span className="flex-1 truncate text-left">
                    {folder.name}
                  </span>
                  {selectedId === folder.id && (
                    <Check className="h-4 w-4 text-primary-600" />
                  )}
                </button>
              ))}

              {flatFolders.length === 0 && (
                <p className="py-4 text-center text-sm text-gray-500">
                  생성된 폴더가 없습니다
                </p>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
