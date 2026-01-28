"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TagList } from "@/components/tags/tag-list";
import { TagCreateDialog } from "@/components/tags/tag-create-dialog";
import { TagEditDialog } from "@/components/tags/tag-edit-dialog";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { useDeleteTag, type Tag } from "@/hooks/use-tags";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TagsPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [deleteTag, setDeleteTag] = useState<Tag | null>(null);
  const deleteMutation = useDeleteTag();

  function handleTagClick(tag: Tag) {
    // Navigate to cards filtered by this tag
    router.push(`/cards?tagIds=${tag.id}`);
  }

  async function handleDelete() {
    if (!deleteTag) return;
    await deleteMutation.mutateAsync(deleteTag.id);
    setDeleteTag(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">태그</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          새 태그
        </Button>
      </div>

      <div className="mt-6">
        <TagList
          onTagClick={handleTagClick}
          onEdit={(tag) => setEditTag(tag)}
          onDelete={(tag) => setDeleteTag(tag)}
        />
      </div>

      {/* Create dialog */}
      <TagCreateDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* Edit dialog */}
      <TagEditDialog
        open={!!editTag}
        onOpenChange={(open) => {
          if (!open) setEditTag(null);
        }}
        tag={editTag}
      />

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={!!deleteTag}
        onOpenChange={(open) => {
          if (!open) setDeleteTag(null);
        }}
        title="태그 삭제"
        description={`"${deleteTag?.name}" 태그를 삭제하시겠습니까? 명함에서 이 태그가 제거됩니다.`}
        confirmLabel="삭제"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
