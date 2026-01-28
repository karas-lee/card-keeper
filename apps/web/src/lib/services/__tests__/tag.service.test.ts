import { describe, it, expect, vi, beforeEach } from "vitest";
import { TagService } from "@/lib/services/tag.service";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/api-response";
import { ERROR_CODES } from "@cardkeeper/shared-constants";

const userId = "user-1";

const mockTag = {
  id: "tag-1",
  userId,
  name: "VIP",
  color: "#8B5CF6",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("TagService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return tags with card counts", async () => {
      vi.mocked(prisma.tag.findMany).mockResolvedValue([
        { ...mockTag, _count: { cards: 3 } },
        {
          id: "tag-2",
          userId,
          name: "중요",
          color: "#EF4444",
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          _count: { cards: 7 },
        },
      ] as any);

      const result = await TagService.list(userId);

      expect(result).toHaveLength(2);
      expect(result[0]!.name).toBe("VIP");
      expect(result[0]!.cardCount).toBe(3);
      expect(result[1]!.name).toBe("중요");
      expect(result[1]!.cardCount).toBe(7);
    });
  });

  describe("create", () => {
    it("should create a tag", async () => {
      vi.mocked(prisma.tag.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.tag.create).mockResolvedValue(mockTag as any);

      const result = await TagService.create(userId, { name: "VIP" });

      expect(result.name).toBe("VIP");
      expect(prisma.tag.create).toHaveBeenCalledWith({
        data: {
          userId,
          name: "VIP",
          color: "#8B5CF6",
        },
      });
    });

    it("should throw 409 when tag name already exists", async () => {
      vi.mocked(prisma.tag.findFirst).mockResolvedValue(mockTag as any);

      try {
        await TagService.create(userId, { name: "VIP" });
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ERROR_CODES.CONFLICT);
        expect((error as AppError).statusCode).toBe(409);
      }
    });
  });

  describe("update", () => {
    it("should update a tag", async () => {
      vi.mocked(prisma.tag.findFirst)
        .mockResolvedValueOnce(mockTag as any) // finding the tag
        .mockResolvedValueOnce(null); // checking name uniqueness
      vi.mocked(prisma.tag.update).mockResolvedValue({
        ...mockTag,
        name: "VVIP",
      } as any);

      const result = await TagService.update(userId, "tag-1", {
        name: "VVIP",
      });

      expect(result.name).toBe("VVIP");
      expect(prisma.tag.update).toHaveBeenCalledWith({
        where: { id: "tag-1" },
        data: { name: "VVIP" },
      });
    });

    it("should throw 404 when tag is not found", async () => {
      vi.mocked(prisma.tag.findFirst).mockResolvedValue(null);

      try {
        await TagService.update(userId, "nonexistent", { name: "수정" });
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ERROR_CODES.NOT_FOUND);
        expect((error as AppError).statusCode).toBe(404);
      }
    });

    it("should throw 409 when new name already exists for another tag", async () => {
      vi.mocked(prisma.tag.findFirst)
        .mockResolvedValueOnce(mockTag as any) // finding the tag
        .mockResolvedValueOnce({
          // name conflict with another tag
          id: "tag-2",
          userId,
          name: "중요",
        } as any);

      try {
        await TagService.update(userId, "tag-1", { name: "중요" });
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ERROR_CODES.CONFLICT);
        expect((error as AppError).statusCode).toBe(409);
      }
    });
  });

  describe("delete", () => {
    it("should delete a tag", async () => {
      vi.mocked(prisma.tag.findFirst).mockResolvedValue(mockTag as any);
      vi.mocked(prisma.tag.delete).mockResolvedValue(mockTag as any);

      await TagService.delete(userId, "tag-1");

      expect(prisma.tag.delete).toHaveBeenCalledWith({
        where: { id: "tag-1" },
      });
    });

    it("should throw 404 when tag is not found", async () => {
      vi.mocked(prisma.tag.findFirst).mockResolvedValue(null);

      try {
        await TagService.delete(userId, "nonexistent");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ERROR_CODES.NOT_FOUND);
        expect((error as AppError).statusCode).toBe(404);
      }
    });
  });
});
