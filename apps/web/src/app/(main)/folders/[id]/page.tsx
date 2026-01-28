"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useFolders,
  useDeleteFolder,
  type Folder,
} from "@/hooks/use-folders";
import { FolderEditDialog } from "@/components/folders/folder-edit-dialog";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  CreditCard,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

export default function FolderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: folders, isLoading } = useFolders();
  const deleteMutation = useDeleteFolder();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Find the current folder from the tree
  function findFolder(
    list: Folder[],
    id: string
  ): Folder | undefined {
    for (const f of list) {
      if (f.id === id) return f;
      if (f.children?.length) {
        const found = findFolder(f.children, id);
        if (found) return found;
      }
    }
    return undefined;
  }

  const folder = folders ? findFolder(folders, params.id) : undefined;

  async function handleDelete() {
    if (!folder) return;
    await deleteMutation.mutateAsync(folder.id);
    setDeleteOpen(false);
    router.push("/folders");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!folder) {
    return (
      <EmptyState
        title="폴더를 찾을 수 없습니다"
        description="존재하지 않는 폴더이거나 삭제된 폴더입니다"
        action={
          <Button variant="outline" onClick={() => router.push("/folders")}>
            폴더 목록으로 돌아가기
          </Button>
        }
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/folders")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <span
            className="h-5 w-5 rounded-full"
            style={{ backgroundColor: folder.color }}
          />
          <h1 className="text-2xl font-semibold text-gray-900">
            {folder.name}
          </h1>
          <Badge variant="secondary">{folder.cardCount}장</Badge>
        </div>

        {!folder.isDefault && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                폴더 수정
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                폴더 삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Card list filtered by folder */}
      <div className="mt-6">
        {folder.cardCount === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="이 폴더에 명함이 없습니다"
            description="명함을 이 폴더로 이동하여 정리하세요"
          />
        ) : (
          <div className="rounded-lg border bg-white p-6">
            <p className="text-sm text-gray-500">
              이 폴더에 {folder.cardCount}개의 명함이 있습니다.
            </p>
            {/* CardList component filtered by folderId will be integrated here */}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <FolderEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        folder={folder}
      />

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="폴더 삭제"
        description={`"${folder.name}" 폴더를 삭제하시겠습니까? 폴더 안의 명함은 삭제되지 않습니다.`}
        confirmLabel="삭제"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
