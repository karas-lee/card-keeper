import { LIMITS } from "@cardkeeper/shared-constants";

export function parsePaginationParams(searchParams: URLSearchParams): {
  cursor?: string;
  limit: number;
} {
  const cursor = searchParams.get("cursor") || undefined;
  const rawLimit = parseInt(searchParams.get("limit") || "", 10);

  const limit =
    Number.isNaN(rawLimit) || rawLimit < 1
      ? LIMITS.DEFAULT_PAGE_SIZE
      : Math.min(rawLimit, LIMITS.MAX_PAGE_SIZE);

  return { cursor, limit };
}

export function buildPaginationMeta<T extends { id: string }>(
  items: T[],
  limit: number,
  totalCount: number
): {
  data: T[];
  meta: { nextCursor: string | null; hasMore: boolean; totalCount: number };
} {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const lastItem = data[data.length - 1];
  const nextCursor = hasMore && lastItem ? lastItem.id : null;

  return {
    data,
    meta: {
      nextCursor,
      hasMore,
      totalCount,
    },
  };
}
