"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { CardForm } from "@/components/cards/card-form";
import { useCardDetail, useUpdateCard } from "@/hooks/use-cards";
import { useFolders } from "@/hooks/use-folders";
import { useTags } from "@/hooks/use-tags";
import { AlertCircle } from "lucide-react";
import type { UpdateCardInput } from "@cardkeeper/shared-utils";

interface EditCardPageContentProps {
  id: string;
}

function EditCardSkeleton() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Skeleton className="mb-6 h-6 w-32" />
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}

export function EditCardPageContent({ id }: EditCardPageContentProps) {
  const router = useRouter();
  const { data: card, isLoading, isError } = useCardDetail(id);
  const updateCard = useUpdateCard();
  const { data: foldersData } = useFolders();
  const { data: tagsData } = useTags();
  const folders = foldersData ?? [];
  const tags = tagsData ?? [];

  const handleSubmit = (data: UpdateCardInput) => {
    updateCard.mutate(
      { id, data },
      {
        onSuccess: () => {
          router.push(`/cards/${id}`);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          돌아가기
        </Button>
        <EditCardSkeleton />
      </div>
    );
  }

  if (isError || !card) {
    return (
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          돌아가기
        </Button>
        <EmptyState
          icon={AlertCircle}
          title="명함을 찾을 수 없습니다"
          description="수정하려는 명함이 존재하지 않거나 삭제되었습니다."
          action={
            <Button onClick={() => router.push("/cards")}>
              목록으로 돌아가기
            </Button>
          }
        />
      </div>
    );
  }

  const defaultValues = {
    name: card.name,
    company: card.company ?? undefined,
    jobTitle: card.jobTitle ?? undefined,
    address: card.address ?? undefined,
    website: card.website ?? undefined,
    memo: card.memo ?? undefined,
    folderId: card.folderId,
    tagIds: card.tags.map((t) => t.id),
    contactDetails: card.contactDetails.map((c) => ({
      type: c.type,
      label: c.label ?? undefined,
      value: c.value,
      isPrimary: c.isPrimary,
    })),
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        돌아가기
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>명함 수정</CardTitle>
        </CardHeader>
        <CardContent>
          <CardForm
            mode="edit"
            defaultValues={defaultValues}
            onSubmit={handleSubmit as (data: import("@cardkeeper/shared-utils").CreateCardInput | UpdateCardInput) => void}
            isLoading={updateCard.isPending}
            onCancel={() => router.back()}
            folders={folders}
            tags={tags}
          />
        </CardContent>
      </Card>
    </div>
  );
}
