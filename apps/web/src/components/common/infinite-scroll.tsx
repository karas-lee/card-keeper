"use client";

import { useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import { LoadingSpinner } from "./loading-spinner";

interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  children: ReactNode;
}

export function InfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  children,
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "100px",
      threshold: 0,
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection]);

  return (
    <div>
      {children}

      {/* Sentinel element for intersection observer */}
      <div ref={sentinelRef} className="h-1" />

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="md" />
        </div>
      )}
    </div>
  );
}
