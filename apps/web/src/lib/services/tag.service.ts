import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/api-response";
import { ERROR_CODES } from "@cardkeeper/shared-constants";

export class TagService {
  static async list(userId: string) {
    const tags = await prisma.tag.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      include: { _count: { select: { cards: true } } },
    });
    return tags.map((t) => ({ ...t, cardCount: t._count.cards }));
  }

  static async create(userId: string, input: { name: string; color?: string }) {
    const existing = await prisma.tag.findFirst({
      where: { userId, name: input.name },
    });
    if (existing) {
      throw new AppError(
        ERROR_CODES.CONFLICT,
        "이미 존재하는 태그 이름입니다",
        409
      );
    }

    return prisma.tag.create({
      data: {
        userId,
        name: input.name,
        color: input.color || "#8B5CF6",
      },
    });
  }

  static async update(
    userId: string,
    tagId: string,
    input: { name?: string; color?: string }
  ) {
    const tag = await prisma.tag.findFirst({
      where: { id: tagId, userId },
    });
    if (!tag) {
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "태그를 찾을 수 없습니다",
        404
      );
    }

    if (input.name) {
      const existing = await prisma.tag.findFirst({
        where: { userId, name: input.name, NOT: { id: tagId } },
      });
      if (existing) {
        throw new AppError(
          ERROR_CODES.CONFLICT,
          "이미 존재하는 태그 이름입니다",
          409
        );
      }
    }

    return prisma.tag.update({
      where: { id: tagId },
      data: input,
    });
  }

  static async delete(userId: string, tagId: string) {
    const tag = await prisma.tag.findFirst({
      where: { id: tagId, userId },
    });
    if (!tag) {
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "태그를 찾을 수 없습니다",
        404
      );
    }

    await prisma.tag.delete({ where: { id: tagId } });
  }
}
