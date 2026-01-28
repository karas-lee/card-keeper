import { describe, it, expect, vi, beforeEach } from "vitest";
import { FolderService } from "@/lib/services/folder.service";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/api-response";
import { ERROR_CODES } from "@cardkeeper/shared-constants";

const userId = "user-1";

const mockFolder = {
  id: "folder-1",
  userId,
  name: "업무",
  color: "#6366F1",
  order: 0,
  parentId: null,
  isDefault: false,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  _count: { cards: 5 },
  children: [
    {
      id: "folder-2",
      userId,
      name: "하위 폴더",
      color: "#8B5CF6",
      order: 0,
      parentId: "folder-1",
      isDefault: false,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      _count: { cards: 2 },
    },
  ],
};

const mockDefaultFolder = {
  id: "folder-default",
  userId,
  name: "미분류",
  color: "#9CA3AF",
  order: 999,
  parentId: null,
  isDefault: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  _count: { cards: 3 },
  children: [],
};

describe("FolderService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return tree structure with root folders and children", async () => {
      vi.mocked(prisma.folder.findMany).mockResolvedValue([
        mockFolder,
        mockDefaultFolder,
      ] as any);

      const result = await FolderService.list(userId);

      expect(result).toHaveLength(2);
      expect(result[0]!.name).toBe("업무");
      expect(result[0]!.cardCount).toBe(5);
      expect(result[0]!.children).toHaveLength(1);
      expect(result[0]!.children[0]!.name).toBe("하위 폴더");
      expect(result[0]!.children[0]!.cardCount).toBe(2);
      expect(result[1]!.name).toBe("미분류");
      expect(result[1]!.cardCount).toBe(3);
      expect(result[1]!.children).toHaveLength(0);
    });
  });

  describe("create", () => {
    it("should create a folder", async () => {
      // No aggregate mock in setup, so we need to add it
      (prisma.folder as any).aggregate = vi.fn().mockResolvedValue({
        _max: { order: 1 },
      });

      vi.mocked(prisma.folder.create).mockResolvedValue({
        id: "folder-new",
        userId,
        name: "새 폴더",
        color: "#6366F1",
        order: 2,
        parentId: null,
        isDefault: false,
      } as any);

      const result = await FolderService.create(userId, {
        name: "새 폴더",
      });

      expect(result.name).toBe("새 폴더");
      expect(prisma.folder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId,
            name: "새 폴더",
            color: "#6366F1",
            parentId: null,
            order: 2,
          }),
        }),
      );
    });

    it("should validate parent folder exists", async () => {
      vi.mocked(prisma.folder.findFirst).mockResolvedValue(null);

      try {
        await FolderService.create(userId, {
          name: "하위 폴더",
          parentId: "nonexistent",
        });
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ERROR_CODES.NOT_FOUND);
        expect((error as AppError).statusCode).toBe(404);
      }
    });

    it("should determine next order value", async () => {
      (prisma.folder as any).aggregate = vi.fn().mockResolvedValue({
        _max: { order: 4 },
      });

      vi.mocked(prisma.folder.create).mockResolvedValue({
        id: "folder-new",
        userId,
        name: "새 폴더",
        color: "#6366F1",
        order: 5,
        parentId: null,
        isDefault: false,
      } as any);

      await FolderService.create(userId, { name: "새 폴더" });

      expect(prisma.folder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            order: 5,
          }),
        }),
      );
    });
  });

  describe("update", () => {
    it("should update a folder", async () => {
      vi.mocked(prisma.folder.findFirst).mockResolvedValue({
        id: "folder-1",
        userId,
        name: "업무",
        isDefault: false,
      } as any);
      vi.mocked(prisma.folder.update).mockResolvedValue({
        id: "folder-1",
        userId,
        name: "업무 - 수정",
        color: "#EF4444",
      } as any);

      const result = await FolderService.update(userId, "folder-1", {
        name: "업무 - 수정",
        color: "#EF4444",
      });

      expect(result.name).toBe("업무 - 수정");
      expect(prisma.folder.update).toHaveBeenCalledWith({
        where: { id: "folder-1" },
        data: { name: "업무 - 수정", color: "#EF4444" },
      });
    });

    it("should throw 404 when folder is not found", async () => {
      vi.mocked(prisma.folder.findFirst).mockResolvedValue(null);

      try {
        await FolderService.update(userId, "nonexistent", {
          name: "수정",
        });
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ERROR_CODES.NOT_FOUND);
        expect((error as AppError).statusCode).toBe(404);
      }
    });
  });

  describe("delete", () => {
    it("should delete a folder", async () => {
      vi.mocked(prisma.folder.findFirst).mockResolvedValue({
        id: "folder-1",
        userId,
        name: "업무",
        isDefault: false,
      } as any);
      vi.mocked(prisma.folder.delete).mockResolvedValue({} as any);

      await FolderService.delete(userId, "folder-1");

      expect(prisma.folder.delete).toHaveBeenCalledWith({
        where: { id: "folder-1" },
      });
    });

    it("should throw 404 when folder is not found", async () => {
      vi.mocked(prisma.folder.findFirst).mockResolvedValue(null);

      try {
        await FolderService.delete(userId, "nonexistent");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ERROR_CODES.NOT_FOUND);
        expect((error as AppError).statusCode).toBe(404);
      }
    });

    it("should throw 403 when trying to delete default folder", async () => {
      vi.mocked(prisma.folder.findFirst).mockResolvedValue({
        id: "folder-default",
        userId,
        name: "미분류",
        isDefault: true,
      } as any);

      try {
        await FolderService.delete(userId, "folder-default");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ERROR_CODES.FORBIDDEN);
        expect((error as AppError).statusCode).toBe(403);
      }
    });
  });
});
