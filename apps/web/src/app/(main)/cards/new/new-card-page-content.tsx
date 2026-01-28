"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardForm } from "@/components/cards/card-form";
import { useCreateCard } from "@/hooks/use-cards";
import { useFolders } from "@/hooks/use-folders";
import { useTags } from "@/hooks/use-tags";
import type { CreateCardInput } from "@cardkeeper/shared-utils";

export function NewCardPageContent() {
  const router = useRouter();
  const createCard = useCreateCard();
  const { data: foldersData } = useFolders();
  const { data: tagsData } = useTags();
  const folders = foldersData ?? [];
  const tags = tagsData ?? [];

  const handleSubmit = (data: CreateCardInput) => {
    createCard.mutate(data, {
      onSuccess: () => {
        router.push("/cards");
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back button */}
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
          <CardTitle>새 명함 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <CardForm
            mode="create"
            onSubmit={handleSubmit as (data: CreateCardInput | import("@cardkeeper/shared-utils").UpdateCardInput) => void}
            isLoading={createCard.isPending}
            onCancel={() => router.back()}
            folders={folders}
            tags={tags}
          />
        </CardContent>
      </Card>
    </div>
  );
}
