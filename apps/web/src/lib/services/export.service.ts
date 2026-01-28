import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/api-response";
import { ERROR_CODES } from "@cardkeeper/shared-constants";
import type { Prisma } from "@prisma/client";

const cardInclude = {
  contactDetails: true,
  folder: { select: { id: true, name: true } },
  tags: { include: { tag: { select: { id: true, name: true } } } },
} satisfies Prisma.BusinessCardInclude;

export class ExportService {
  // Get cards based on export scope
  private static async getCards(
    userId: string,
    params: {
      scope: string;
      cardIds?: string[];
      folderId?: string;
      tagId?: string;
    },
  ) {
    const where: Prisma.BusinessCardWhereInput = { userId };

    switch (params.scope) {
      case "single":
      case "selected":
        if (!params.cardIds?.length) {
          throw new AppError(
            ERROR_CODES.VALIDATION_ERROR,
            "카드를 선택해주세요",
            400,
          );
        }
        where.id = { in: params.cardIds };
        break;
      case "folder":
        if (!params.folderId) {
          throw new AppError(
            ERROR_CODES.VALIDATION_ERROR,
            "폴더를 선택해주세요",
            400,
          );
        }
        where.folderId = params.folderId;
        break;
      case "tag":
        if (!params.tagId) {
          throw new AppError(
            ERROR_CODES.VALIDATION_ERROR,
            "태그를 선택해주세요",
            400,
          );
        }
        where.tags = { some: { tagId: params.tagId } };
        break;
      case "all":
        break;
    }

    return prisma.businessCard.findMany({
      where,
      include: cardInclude,
      orderBy: { name: "asc" },
    });
  }

  // Generate vCard string
  static async exportVCard(userId: string, params: any): Promise<string> {
    const cards = await this.getCards(userId, params);
    const version = params.version || "3.0";

    return cards
      .map((card) => {
        const lines: string[] = ["BEGIN:VCARD", `VERSION:${version}`];

        lines.push(`FN:${card.name}`);
        if (version === "4.0") {
          lines.push(`N:${card.name};;;`);
        } else {
          lines.push(`N:${card.name};;;`);
        }

        if (card.company) lines.push(`ORG:${card.company}`);
        if (card.jobTitle) lines.push(`TITLE:${card.jobTitle}`);

        card.contactDetails.forEach((cd) => {
          if (cd.type === "PHONE" || cd.type === "MOBILE") {
            const typeStr = cd.type === "MOBILE" ? "CELL" : "WORK";
            lines.push(
              version === "4.0"
                ? `TEL;TYPE=${typeStr};VALUE=uri:tel:${cd.value}`
                : `TEL;TYPE=${typeStr}:${cd.value}`,
            );
          } else if (cd.type === "EMAIL") {
            lines.push(
              version === "4.0"
                ? `EMAIL;TYPE=WORK:${cd.value}`
                : `EMAIL;TYPE=INTERNET:${cd.value}`,
            );
          } else if (cd.type === "FAX") {
            lines.push(`TEL;TYPE=FAX:${cd.value}`);
          }
        });

        if (card.address) lines.push(`ADR;TYPE=WORK:;;${card.address};;;;`);
        if (card.website) lines.push(`URL:${card.website}`);
        if (card.memo)
          lines.push(`NOTE:${card.memo.replace(/\n/g, "\\n")}`);

        lines.push("END:VCARD");
        return lines.join("\r\n");
      })
      .join("\r\n");
  }

  // Generate CSV string
  static async exportCsv(userId: string, params: any): Promise<string> {
    const cards = await this.getCards(userId, params);
    const BOM = "\uFEFF"; // UTF-8 BOM for Excel
    const headers = [
      "이름",
      "회사",
      "직함",
      "전화번호",
      "이메일",
      "팩스",
      "주소",
      "웹사이트",
      "메모",
      "폴더",
      "태그",
    ];

    const rows = cards.map((card) => {
      const phones = card.contactDetails
        .filter((c) => c.type === "PHONE" || c.type === "MOBILE")
        .map((c) => c.value)
        .join("; ");
      const emails = card.contactDetails
        .filter((c) => c.type === "EMAIL")
        .map((c) => c.value)
        .join("; ");
      const faxes = card.contactDetails
        .filter((c) => c.type === "FAX")
        .map((c) => c.value)
        .join("; ");
      const tags = card.tags
        .map((ct: any) => ct.tag.name)
        .join(", ");

      return [
        card.name,
        card.company || "",
        card.jobTitle || "",
        phones,
        emails,
        faxes,
        card.address || "",
        card.website || "",
        card.memo?.replace(/"/g, '""') || "",
        (card.folder as any)?.name || "",
        tags,
      ]
        .map((v) => `"${v}"`)
        .join(",");
    });

    return BOM + [headers.join(","), ...rows].join("\r\n");
  }
}
