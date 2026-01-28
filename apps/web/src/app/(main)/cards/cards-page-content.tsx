"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardSearchBar } from "@/components/cards/card-search-bar";
import { CardFilterBar } from "@/components/cards/card-filter-bar";
import { CardList } from "@/components/cards/card-list";
import { CardSelectionBar } from "@/components/cards/card-selection-bar";
import { useSearch } from "@/hooks/use-search";
import { useUiStore } from "@/stores/ui.store";
import type { CardListParams } from "@cardkeeper/shared-types";

export function CardsPageContent() {
  const { query, setQuery, debouncedQuery } = useSearch();
  const { isSelectionMode, setSelectionMode } = useUiStore();

  const [folderId, setFolderId] = useState<string | undefined>();
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState<boolean | undefined>();
  const [sort, setSort] = useState<string>("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  // TODO: Replace with actual folder/tag data from queries
  const folders: Array<{ id: string; name: string }> = [];
  const tags: Array<{ id: string; name: string; color: string | null }> = [];

  const params = useMemo<CardListParams>(
    () => ({
      search: debouncedQuery || undefined,
      folderId,
      tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      isFavorite,
      sort: sort as CardListParams["sort"],
      order,
      limit: 20,
    }),
    [debouncedQuery, folderId, selectedTagIds, isFavorite, sort, order],
  );

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">명함</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={isSelectionMode ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSelectionMode(!isSelectionMode)}
          >
            <CheckSquare className="mr-1 h-4 w-4" />
            {isSelectionMode ? "선택 해제" : "선택"}
          </Button>
          <Button asChild>
            <Link href="/cards/new">
              <Plus className="mr-1 h-4 w-4" />
              명함 추가
            </Link>
          </Button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardSearchBar value={query} onChange={setQuery} />
        <CardFilterBar
          folderId={folderId}
          onFolderChange={setFolderId}
          selectedTagIds={selectedTagIds}
          onTagChange={setSelectedTagIds}
          isFavorite={isFavorite}
          onFavoriteChange={setIsFavorite}
          sort={sort}
          onSortChange={setSort}
          order={order}
          onOrderChange={setOrder}
          folders={folders}
          tags={tags}
        />
      </div>

      {/* Card list */}
      <CardList params={params} />

      {/* Selection bar */}
      {isSelectionMode && (
        <CardSelectionBar folders={folders} tags={tags} />
      )}

      {/* FAB for mobile */}
      <Link
        href="/cards/new"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-colors hover:bg-primary-700 sm:hidden"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">명함 추가</span>
      </Link>
    </div>
  );
}
