import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/api-response";
import { ERROR_CODES, LIMITS } from "@cardkeeper/shared-constants";
import type { Prisma } from "@prisma/client";

// Standard include for card queries (gets folder info, tags, contact details)
const cardInclude = {
  folder: { select: { id: true, name: true, color: true } },
  tags: {
    include: { tag: { select: { id: true, name: true, color: true } } },
  },
  contactDetails: true,
} satisfies Prisma.BusinessCardInclude;

// Transform DB result to API format (flatten tags from join table)
function transformCard(card: any) {
  return {
    ...card,
    tags: card.tags?.map((ct: any) => ct.tag) ?? [],
  };
}

export class CardService {
  // List cards with filters, sorting, and cursor pagination
  static async list(
    userId: string,
    params: {
      search?: string;
      folderId?: string;
      tagIds?: string;
      tagMode?: "AND" | "OR";
      isFavorite?: boolean;
      company?: string;
      startDate?: Date;
      endDate?: Date;
      sort?: string;
      order?: string;
      cursor?: string;
      limit?: number;
    }
  ) {
    const limit = Math.min(
      params.limit || LIMITS.DEFAULT_PAGE_SIZE,
      LIMITS.MAX_PAGE_SIZE
    );

    const where: Prisma.BusinessCardWhereInput = { userId };

    // Search filter
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { company: { contains: params.search, mode: "insensitive" } },
        { jobTitle: { contains: params.search, mode: "insensitive" } },
        { memo: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.folderId) where.folderId = params.folderId;
    if (params.isFavorite !== undefined) where.isFavorite = params.isFavorite;
    if (params.company)
      where.company = { contains: params.company, mode: "insensitive" };

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    // Tag filter
    if (params.tagIds) {
      const tagIdArray = params.tagIds.split(",").filter(Boolean);
      if (tagIdArray.length > 0) {
        if (params.tagMode === "AND") {
          where.AND = tagIdArray.map((tagId) => ({
            tags: { some: { tagId } },
          }));
        } else {
          where.tags = { some: { tagId: { in: tagIdArray } } };
        }
      }
    }

    // Sort
    const sortField = params.sort || "createdAt";
    const sortOrder = params.order || "desc";
    const orderBy: any = { [sortField]: sortOrder };

    // Count total
    const totalCount = await prisma.businessCard.count({ where });

    // Fetch with cursor
    const cards = await prisma.businessCard.findMany({
      where,
      include: cardInclude,
      orderBy,
      take: limit + 1,
      ...(params.cursor
        ? { cursor: { id: params.cursor }, skip: 1 }
        : {}),
    });

    const hasMore = cards.length > limit;
    const data = cards.slice(0, limit).map(transformCard);
    const nextCursor = hasMore ? data[data.length - 1]?.id ?? null : null;

    return { data, meta: { nextCursor, hasMore, totalCount } };
  }

  // Get single card
  static async getById(userId: string, cardId: string) {
    const card = await prisma.businessCard.findFirst({
      where: { id: cardId, userId },
      include: cardInclude,
    });
    if (!card)
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "명함을 찾을 수 없습니다",
        404
      );
    return transformCard(card);
  }

  // Create card
  static async create(userId: string, input: any) {
    const { tagIds, contactDetails, ...cardData } = input;

    const card = await prisma.businessCard.create({
      data: {
        ...cardData,
        userId,
        ...(contactDetails?.length
          ? {
              contactDetails: { create: contactDetails },
            }
          : {}),
        ...(tagIds?.length
          ? {
              tags: {
                create: tagIds.map((tagId: string) => ({ tagId })),
              },
            }
          : {}),
      },
      include: cardInclude,
    });

    return transformCard(card);
  }

  // Update card
  static async update(userId: string, cardId: string, input: any) {
    const existing = await prisma.businessCard.findFirst({
      where: { id: cardId, userId },
    });
    if (!existing)
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "명함을 찾을 수 없습니다",
        404
      );

    const { tagIds, contactDetails, ...cardData } = input;

    const card = await prisma.businessCard.update({
      where: { id: cardId },
      data: {
        ...cardData,
        ...(contactDetails !== undefined
          ? {
              contactDetails: {
                deleteMany: {},
                create: contactDetails || [],
              },
            }
          : {}),
        ...(tagIds !== undefined
          ? {
              tags: {
                deleteMany: {},
                create: (tagIds || []).map((tagId: string) => ({ tagId })),
              },
            }
          : {}),
      },
      include: cardInclude,
    });

    return transformCard(card);
  }

  // Delete card
  static async delete(userId: string, cardId: string) {
    const existing = await prisma.businessCard.findFirst({
      where: { id: cardId, userId },
    });
    if (!existing)
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "명함을 찾을 수 없습니다",
        404
      );
    await prisma.businessCard.delete({ where: { id: cardId } });
  }

  // Toggle favorite
  static async toggleFavorite(
    userId: string,
    cardId: string,
    isFavorite: boolean
  ) {
    const existing = await prisma.businessCard.findFirst({
      where: { id: cardId, userId },
    });
    if (!existing)
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "명함을 찾을 수 없습니다",
        404
      );
    await prisma.businessCard.update({
      where: { id: cardId },
      data: { isFavorite },
    });
  }

  // Move to folder
  static async moveToFolder(
    userId: string,
    cardId: string,
    folderId: string | null
  ) {
    const existing = await prisma.businessCard.findFirst({
      where: { id: cardId, userId },
    });
    if (!existing)
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "명함을 찾을 수 없습니다",
        404
      );
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId },
      });
      if (!folder)
        throw new AppError(
          ERROR_CODES.NOT_FOUND,
          "폴더를 찾을 수 없습니다",
          404
        );
    }
    await prisma.businessCard.update({
      where: { id: cardId },
      data: { folderId },
    });
  }

  // Add tag
  static async addTag(userId: string, cardId: string, tagId: string) {
    const [card, tag] = await Promise.all([
      prisma.businessCard.findFirst({ where: { id: cardId, userId } }),
      prisma.tag.findFirst({ where: { id: tagId, userId } }),
    ]);
    if (!card)
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "명함을 찾을 수 없습니다",
        404
      );
    if (!tag)
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "태그를 찾을 수 없습니다",
        404
      );

    // Check tag limit
    const tagCount = await prisma.cardTag.count({ where: { cardId } });
    if (tagCount >= LIMITS.MAX_TAGS_PER_CARD) {
      throw new AppError(
        ERROR_CODES.LIMIT_EXCEEDED,
        `태그는 최대 ${LIMITS.MAX_TAGS_PER_CARD}개까지 추가할 수 있습니다`,
        400
      );
    }

    await prisma.cardTag.upsert({
      where: { cardId_tagId: { cardId, tagId } },
      create: { cardId, tagId },
      update: {},
    });
  }

  // Remove tag
  static async removeTag(userId: string, cardId: string, tagId: string) {
    const card = await prisma.businessCard.findFirst({
      where: { id: cardId, userId },
    });
    if (!card)
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "명함을 찾을 수 없습니다",
        404
      );
    await prisma.cardTag.deleteMany({ where: { cardId, tagId } });
  }

  // Batch delete
  static async batchDelete(userId: string, cardIds: string[]) {
    await prisma.businessCard.deleteMany({
      where: { id: { in: cardIds }, userId },
    });
  }

  // Batch move
  static async batchMove(
    userId: string,
    cardIds: string[],
    folderId: string | null
  ) {
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId },
      });
      if (!folder)
        throw new AppError(
          ERROR_CODES.NOT_FOUND,
          "폴더를 찾을 수 없습니다",
          404
        );
    }
    await prisma.businessCard.updateMany({
      where: { id: { in: cardIds }, userId },
      data: { folderId },
    });
  }

  // Batch tag
  static async batchTag(
    userId: string,
    cardIds: string[],
    tagIds: string[],
    action: "add" | "remove"
  ) {
    if (action === "add") {
      const data = cardIds.flatMap((cardId) =>
        tagIds.map((tagId) => ({ cardId, tagId }))
      );
      await prisma.cardTag.createMany({ data, skipDuplicates: true });
    } else {
      await prisma.cardTag.deleteMany({
        where: { cardId: { in: cardIds }, tagId: { in: tagIds } },
      });
    }
  }
}
