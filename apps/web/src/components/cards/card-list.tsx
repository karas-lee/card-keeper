"use client";

import { useEffect, useMemo } from "react";
import { CreditCard } from "lucide-react";
import { CardGridView } from "./card-grid-view";
import { CardListView } from "./card-list-view";
import { EmptyState } from "@/components/common/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCards } from "@/hooks/use-cards";
import { useIntersection } from "@/hooks/use-intersection";
import { useUiStore } from "@/stores/ui.store";
import type { CardListParams } from "@cardkeeper/shared-types";

interface CardListProps {
  params: CardListParams;
}

function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="mb-3 flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CardListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3"
        >
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="hidden h-5 w-16 rounded-full md:block" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  );
}

export function CardList({ params }: CardListProps) {
  const { viewMode } = useUiStore();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useCards(params);

  const { ref: sentinelRef, isIntersecting } = useIntersection({
    rootMargin: "200px",
    threshold: 0,
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allCards = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  if (isLoading) {
    return viewMode === "grid" ? (
      <CardGridSkeleton />
    ) : (
      <CardListSkeleton />
    );
  }

  if (allCards.length === 0) {
    return (
      <EmptyState
        icon={CreditCard}
        title="명함이 없습니다"
        description="새로운 명함을 추가하거나 스캔하여 시작하세요."
        action={
          <Button asChild>
            <a href="/cards/new">명함 추가</a>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      {viewMode === "grid" ? (
        <CardGridView cards={allCards} />
      ) : (
        <CardListView cards={allCards} />
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" />

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <div className="text-sm text-gray-500">불러오는 중...</div>
        </div>
      )}
    </div>
  );
}
