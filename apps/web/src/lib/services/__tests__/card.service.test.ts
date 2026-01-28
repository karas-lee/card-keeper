import { describe, it, expect, vi, beforeEach } from "vitest";
import { CardService } from "@/lib/services/card.service";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/api-response";
import { ERROR_CODES } from "@cardkeeper/shared-constants";

const userId = "user-1";

const mockCard = {
  id: "card-1",
  userId,
  name: "홍길동",
  company: "삼성전자",
  jobTitle: "개발자",
  address: "서울시 강남구",
  website: "https://samsung.com",
  memo: "메모",
  imageUrl: null,
  thumbnailUrl: null,
  isFavorite: false,
  folderId: "folder-1",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  folder: { id: "folder-1", name: "업무", color: "#6366F1" },
  tags: [{ tag: { id: "tag-1", name: "VIP", color: "#8B5CF6" } }],
  contactDetails: [
    { id: "cd-1", type: "PHONE", value: "010-1234-5678", label: null, cardId: "card-1" },
    { id: "cd-2", type: "EMAIL", value: "hong@samsung.com", label: null, cardId: "card-1" },
  ],
};

const mockCardList = [mockCard];

describe("CardService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Add mock methods not present in setup.ts
    (prisma.businessCard as any).findFirst = vi.fn();
    (prisma.businessCard as any).deleteMany = vi.fn();
    (prisma.businessCard as any).updateMany = vi.fn();
    (prisma.folder as any).findFirst = vi.fn();
  });

  describe("list", () => {
    it("should return paginated card data", async () => {
      vi.mocked(prisma.businessCard.count).mockResolvedValue(1);
      vi.mocked(prisma.businessCard.findMany).mockResolvedValue(
        mockCardList as any,
      );

      const result = await CardService.list(userId, {});

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe("홍길동");
      // Tags should be flattened
      expect(result.data[0].tags).toEqual([
        { id: "tag-1", name: "VIP", color: "#8B5CF6" },
      ]);
      expect(result.meta.totalCount).toBe(1);
      expect(result.meta.hasMore).toBe(false);
    });

    it("should apply search filter", async () => {
      vi.mocked(prisma.businessCard.count).mockResolvedValue(0);
      vi.mocked(prisma.businessCard.findMany).mockResolvedValue([]);

      await CardService.list(userId, { search: "삼성" });

      expect(prisma.businessCard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            OR: expect.arrayContaining([
              expect.objectContaining({
                name: { contains: "삼성", mode: "insensitive" },
              }),
            ]),
          }),
        }),
      );
    });

    it("should apply folder filter", async () => {
      vi.mocked(prisma.businessCard.count).mockResolvedValue(0);
      vi.mocked(prisma.businessCard.findMany).mockResolvedValue([]);

      await CardService.list(userId, { folderId: "folder-1" });

      expect(prisma.businessCard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            folderId: "folder-1",
          }),
        }),
      );
    });

    it("should apply tag filter", async () => {
      vi.mocked(prisma.businessCard.count).mockResolvedValue(0);
      vi.mocked(prisma.businessCard.findMany).mockResolvedValue([]);

      await CardService.list(userId, { tagIds: "tag-1,tag-2" });

      expect(prisma.businessCard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            tags: { some: { tagId: { in: ["tag-1", "tag-2"] } } },
          }),
        }),
      );
    });

    it("should handle cursor pagination with hasMore", async () => {
      // Return limit+1 items to indicate hasMore
      const manyCards = Array.from({ length: 21 }, (_, i) => ({
        ...mockCard,
        id: `card-${i}`,
      }));
      vi.mocked(prisma.businessCard.count).mockResolvedValue(30);
      vi.mocked(prisma.businessCard.findMany).mockResolvedValue(
        manyCards as any,
      );

      const result = await CardService.list(userId, { limit: 20 });

      expect(result.data).toHaveLength(20);
      expect(result.meta.hasMore).toBe(true);
      expect(result.meta.nextCursor).toBe("card-19");
    });
  });

  describe("getById", () => {
    it("should return a card", async () => {
      vi.mocked(prisma.businessCard.findFirst).mockResolvedValue(
        mockCard as any,
      );

      const result = await CardService.getById(userId, "card-1");

      expect(result.name).toBe("홍길동");
      expect(result.tags).toEqual([
        { id: "tag-1", name: "VIP", color: "#8B5CF6" },
      ]);
    });

    it("should throw 404 when card is not found", async () => {
      vi.mocked(prisma.businessCard.findFirst).mockResolvedValue(null);

      try {
        await CardService.getById(userId, "nonexistent");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ERROR_CODES.NOT_FOUND);
        expect((error as AppError).statusCode).toBe(404);
      }
    });
  });

  describe("create", () => {
    it("should create a card with contact details and tags", async () => {
      vi.mocked(prisma.businessCard.create).mockResolvedValue(mockCard as any);

      const input = {
        name: "홍길동",
        company: "삼성전자",
        jobTitle: "개발자",
        folderId: "folder-1",
        contactDetails: [
          { type: "PHONE", value: "010-1234-5678" },
          { type: "EMAIL", value: "hong@samsung.com" },
        ],
        tagIds: ["tag-1"],
      };

      const result = await CardService.create(userId, input);

      expect(result.name).toBe("홍길동");
      expect(prisma.businessCard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: "홍길동",
            company: "삼성전자",
            userId,
            contactDetails: { create: input.contactDetails },
            tags: { create: [{ tagId: "tag-1" }] },
          }),
        }),
      );
    });
  });

  describe("update", () => {
    it("should update the card", async () => {
      vi.mocked(prisma.businessCard.findFirst).mockResolvedValue(
        mockCard as any,
      );
      vi.mocked(prisma.businessCard.update).mockResolvedValue({
        ...mockCard,
        name: "김철수",
      } as any);

      const result = await CardService.update(userId, "card-1", {
        name: "김철수",
      });

      expect(result.name).toBe("김철수");
      expect(prisma.businessCard.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "card-1" },
          data: expect.objectContaining({ name: "김철수" }),
        }),
      );
    });

    it("should throw 404 when card is not found", async () => {
      vi.mocked(prisma.businessCard.findFirst).mockResolvedValue(null);

      try {
        await CardService.update(userId, "nonexistent", { name: "김철수" });
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ERROR_CODES.NOT_FOUND);
        expect((error as AppError).statusCode).toBe(404);
      }
    });
  });

  describe("delete", () => {
    it("should delete the card", async () => {
      vi.mocked(prisma.businessCard.findFirst).mockResolvedValue(
        mockCard as any,
      );
      vi.mocked(prisma.businessCard.delete).mockResolvedValue(mockCard as any);

      await CardService.delete(userId, "card-1");

      expect(prisma.businessCard.delete).toHaveBeenCalledWith({
        where: { id: "card-1" },
      });
    });

    it("should throw 404 when card is not found", async () => {
      vi.mocked(prisma.businessCard.findFirst).mockResolvedValue(null);

      try {
        await CardService.delete(userId, "nonexistent");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ERROR_CODES.NOT_FOUND);
        expect((error as AppError).statusCode).toBe(404);
      }
    });
  });

  describe("toggleFavorite", () => {
    it("should toggle the favorite status", async () => {
      vi.mocked(prisma.businessCard.findFirst).mockResolvedValue(
        mockCard as any,
      );
      vi.mocked(prisma.businessCard.update).mockResolvedValue({} as any);

      await CardService.toggleFavorite(userId, "card-1", true);

      expect(prisma.businessCard.update).toHaveBeenCalledWith({
        where: { id: "card-1" },
        data: { isFavorite: true },
      });
    });

    it("should throw 404 when card is not found", async () => {
      vi.mocked(prisma.businessCard.findFirst).mockResolvedValue(null);

      try {
        await CardService.toggleFavorite(userId, "nonexistent", true);
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ERROR_CODES.NOT_FOUND);
        expect((error as AppError).statusCode).toBe(404);
      }
    });
  });

  describe("batchDelete", () => {
    it("should delete multiple cards", async () => {
      vi.mocked(prisma.businessCard.deleteMany).mockResolvedValue({
        count: 2,
      });

      await CardService.batchDelete(userId, ["card-1", "card-2"]);

      expect(prisma.businessCard.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ["card-1", "card-2"] }, userId },
      });
    });
  });

  describe("batchMove", () => {
    it("should move cards to a folder", async () => {
      vi.mocked(prisma.folder.findFirst).mockResolvedValue({
        id: "folder-2",
        userId,
        name: "개인",
      } as any);
      vi.mocked(prisma.businessCard.updateMany).mockResolvedValue({
        count: 2,
      });

      await CardService.batchMove(userId, ["card-1", "card-2"], "folder-2");

      expect(prisma.businessCard.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ["card-1", "card-2"] }, userId },
        data: { folderId: "folder-2" },
      });
    });

    it("should throw 404 when folder is not found", async () => {
      vi.mocked(prisma.folder.findFirst).mockResolvedValue(null);

      try {
        await CardService.batchMove(
          userId,
          ["card-1"],
          "nonexistent-folder",
        );
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ERROR_CODES.NOT_FOUND);
        expect((error as AppError).statusCode).toBe(404);
      }
    });
  });
});
