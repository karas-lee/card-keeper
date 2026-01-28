import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/api-response";
import { ERROR_CODES } from "@cardkeeper/shared-constants";

export class FolderService {
  static async list(userId: string) {
    const folders = await prisma.folder.findMany({
      where: { userId },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { cards: true } },
        children: {
          include: { _count: { select: { cards: true } } },
          orderBy: { order: "asc" },
        },
      },
    });

    // Build tree: root folders with nested children
    const rootFolders = folders.filter((f) => !f.parentId);
    return rootFolders.map((f) => ({
      ...f,
      cardCount: f._count.cards,
      children: (f.children || []).map((c) => ({
        ...c,
        cardCount: (c as any)._count.cards,
        children: [],
      })),
    }));
  }

  static async create(
    userId: string,
    input: { name: string; color?: string; parentId?: string | null }
  ) {
    // Validate parent folder if provided
    if (input.parentId) {
      const parent = await prisma.folder.findFirst({
        where: { id: input.parentId, userId },
      });
      if (!parent) {
        throw new AppError(
          ERROR_CODES.NOT_FOUND,
          "상위 폴더를 찾을 수 없습니다",
          404
        );
      }
    }

    // Determine next order value
    const maxOrder = await prisma.folder.aggregate({
      where: { userId, parentId: input.parentId || null },
      _max: { order: true },
    });

    return prisma.folder.create({
      data: {
        userId,
        name: input.name,
        color: input.color || "#6366F1",
        parentId: input.parentId || null,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
  }

  static async update(
    userId: string,
    folderId: string,
    input: { name?: string; color?: string; order?: number }
  ) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId },
    });
    if (!folder) {
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "폴더를 찾을 수 없습니다",
        404
      );
    }

    return prisma.folder.update({
      where: { id: folderId },
      data: input,
    });
  }

  static async delete(userId: string, folderId: string) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId },
    });
    if (!folder) {
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "폴더를 찾을 수 없습니다",
        404
      );
    }
    if (folder.isDefault) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "기본 폴더는 삭제할 수 없습니다",
        403
      );
    }

    // Cards in this folder will have folderId set to null (onDelete: SetNull)
    await prisma.folder.delete({ where: { id: folderId } });
  }
}
