"use client";

import { useFolders, type Folder } from "@/hooks/use-folders";
import { FolderItem } from "./folder-item";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { EmptyState } from "@/components/common/empty-state";
import { FolderOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FolderTreeProps {
  activeFolderId?: string;
  onFolderSelect?: (folderId: string) => void;
  onEdit?: (folder: Folder) => void;
  onDelete?: (folder: Folder) => void;
}

export function FolderTree({
  activeFolderId,
  onFolderSelect,
  onEdit,
  onDelete,
}: FolderTreeProps) {
  const { data: folders, isLoading, error } = useFolders();

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
        폴더를 불러오는데 실패했습니다
      </p>
    );
  }

  if (!folders || folders.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="폴더가 없습니다"
        description="새 폴더를 만들어 명함을 정리하세요"
      />
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {folders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            level={0}
            activeFolderId={activeFolderId}
            onSelect={onFolderSelect}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
