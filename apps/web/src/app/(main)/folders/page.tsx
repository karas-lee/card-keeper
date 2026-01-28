"use client";

import { useState } from "react";
import { FolderTree } from "@/components/folders/folder-tree";
import { FolderCreateDialog } from "@/components/folders/folder-create-dialog";
import { FolderEditDialog } from "@/components/folders/folder-edit-dialog";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { useDeleteFolder, type Folder } from "@/hooks/use-folders";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function FoldersPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editFolder, setEditFolder] = useState<Folder | null>(null);
  const [deleteFolder, setDeleteFolder] = useState<Folder | null>(null);
  const deleteMutation = useDeleteFolder();

  async function handleDelete() {
    if (!deleteFolder) return;
    await deleteMutation.mutateAsync(deleteFolder.id);
    setDeleteFolder(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">폴더</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          새 폴더
        </Button>
      </div>

      <div className="mt-6 rounded-lg border bg-white">
        <FolderTree
          onEdit={(folder) => setEditFolder(folder)}
          onDelete={(folder) => setDeleteFolder(folder)}
        />
      </div>

      {/* Create dialog */}
      <FolderCreateDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* Edit dialog */}
      <FolderEditDialog
        open={!!editFolder}
        onOpenChange={(open) => {
          if (!open) setEditFolder(null);
        }}
        folder={editFolder}
      />

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={!!deleteFolder}
        onOpenChange={(open) => {
          if (!open) setDeleteFolder(null);
        }}
        title="폴더 삭제"
        description={`"${deleteFolder?.name}" 폴더를 삭제하시겠습니까? 폴더 안의 명함은 삭제되지 않습니다.`}
        confirmLabel="삭제"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
