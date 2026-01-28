"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CardDetail } from "@/components/cards/card-detail";
import { EmptyState } from "@/components/common/empty-state";
import { useCardDetail } from "@/hooks/use-cards";
import { AlertCircle } from "lucide-react";

interface CardDetailPageContentProps {
  id: string;
}

function CardDetailSkeleton() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}

export function CardDetailPageContent({ id }: CardDetailPageContentProps) {
  const router = useRouter();
  const { data: card, isLoading, isError } = useCardDetail(id);

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
        <CardDetailSkeleton />
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
          description="요청하신 명함이 존재하지 않거나 삭제되었습니다."
          action={
            <Button onClick={() => router.push("/cards")}>
              목록으로 돌아가기
            </Button>
          }
        />
      </div>
    );
  }

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

      <CardDetail card={card} />
    </div>
  );
}
