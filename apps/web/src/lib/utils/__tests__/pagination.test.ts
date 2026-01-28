import { describe, it, expect } from "vitest";
import { parsePaginationParams, buildPaginationMeta } from "../pagination";

describe("Pagination utilities", () => {
  describe("parsePaginationParams", () => {
    it("should return default limit when no limit param is provided", () => {
      const params = new URLSearchParams();
      const result = parsePaginationParams(params);

      expect(result.limit).toBe(20); // LIMITS.DEFAULT_PAGE_SIZE
      expect(result.cursor).toBeUndefined();
    });

    it("should parse a valid limit parameter", () => {
      const params = new URLSearchParams({ limit: "50" });
      const result = parsePaginationParams(params);

      expect(result.limit).toBe(50);
    });

    it("should parse the cursor parameter", () => {
      const params = new URLSearchParams({ cursor: "abc-123" });
      const result = parsePaginationParams(params);

      expect(result.cursor).toBe("abc-123");
    });

    it("should cap limit at MAX_PAGE_SIZE (100)", () => {
      const params = new URLSearchParams({ limit: "500" });
      const result = parsePaginationParams(params);

      expect(result.limit).toBe(100); // LIMITS.MAX_PAGE_SIZE
    });

    it("should use default limit for non-numeric limit value", () => {
      const params = new URLSearchParams({ limit: "abc" });
      const result = parsePaginationParams(params);

      expect(result.limit).toBe(20); // LIMITS.DEFAULT_PAGE_SIZE
    });

    it("should use default limit for zero", () => {
      const params = new URLSearchParams({ limit: "0" });
      const result = parsePaginationParams(params);

      expect(result.limit).toBe(20); // LIMITS.DEFAULT_PAGE_SIZE
    });

    it("should use default limit for negative values", () => {
      const params = new URLSearchParams({ limit: "-5" });
      const result = parsePaginationParams(params);

      expect(result.limit).toBe(20); // LIMITS.DEFAULT_PAGE_SIZE
    });

    it("should return undefined cursor when cursor param is empty string", () => {
      const params = new URLSearchParams({ cursor: "" });
      const result = parsePaginationParams(params);

      expect(result.cursor).toBeUndefined();
    });

    it("should handle both cursor and limit together", () => {
      const params = new URLSearchParams({ cursor: "item-99", limit: "25" });
      const result = parsePaginationParams(params);

      expect(result.cursor).toBe("item-99");
      expect(result.limit).toBe(25);
    });
  });

  describe("buildPaginationMeta", () => {
    const makeItems = (count: number) =>
      Array.from({ length: count }, (_, i) => ({
        id: `item-${i + 1}`,
        name: `Item ${i + 1}`,
      }));

    it("should return all items when items.length <= limit", () => {
      const items = makeItems(5);
      const result = buildPaginationMeta(items, 10, 5);

      expect(result.data).toHaveLength(5);
      expect(result.meta.hasMore).toBe(false);
      expect(result.meta.nextCursor).toBeNull();
      expect(result.meta.totalCount).toBe(5);
    });

    it("should slice items and set hasMore when items.length > limit", () => {
      // Simulate fetching limit+1 items to detect hasMore
      const items = makeItems(11);
      const result = buildPaginationMeta(items, 10, 50);

      expect(result.data).toHaveLength(10);
      expect(result.meta.hasMore).toBe(true);
      expect(result.meta.nextCursor).toBe("item-10");
      expect(result.meta.totalCount).toBe(50);
    });

    it("should set nextCursor to the last item id when hasMore is true", () => {
      const items = makeItems(21);
      const result = buildPaginationMeta(items, 20, 100);

      expect(result.meta.nextCursor).toBe("item-20");
      expect(result.meta.hasMore).toBe(true);
    });

    it("should handle an empty items array", () => {
      const result = buildPaginationMeta([], 20, 0);

      expect(result.data).toHaveLength(0);
      expect(result.meta.hasMore).toBe(false);
      expect(result.meta.nextCursor).toBeNull();
      expect(result.meta.totalCount).toBe(0);
    });

    it("should handle exactly limit items (no hasMore)", () => {
      const items = makeItems(20);
      const result = buildPaginationMeta(items, 20, 20);

      expect(result.data).toHaveLength(20);
      expect(result.meta.hasMore).toBe(false);
      expect(result.meta.nextCursor).toBeNull();
    });

    it("should pass through totalCount regardless of items length", () => {
      const items = makeItems(5);
      const result = buildPaginationMeta(items, 10, 1000);

      expect(result.meta.totalCount).toBe(1000);
    });

    it("should handle a single item", () => {
      const items = makeItems(1);
      const result = buildPaginationMeta(items, 20, 1);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.id).toBe("item-1");
      expect(result.meta.hasMore).toBe(false);
      expect(result.meta.nextCursor).toBeNull();
    });

    it("should handle limit of 1 with hasMore", () => {
      const items = makeItems(2);
      const result = buildPaginationMeta(items, 1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.id).toBe("item-1");
      expect(result.meta.hasMore).toBe(true);
      expect(result.meta.nextCursor).toBe("item-1");
    });
  });
});
