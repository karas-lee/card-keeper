import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExportService } from "@/lib/services/export.service";
import { prisma } from "@/lib/db";

const userId = "user-1";

const mockCards = [
  {
    id: "card-1",
    name: "홍길동",
    company: "삼성전자",
    jobTitle: "개발자",
    address: "서울시 강남구",
    website: "https://samsung.com",
    memo: "메모",
    imageUrl: null,
    thumbnailUrl: null,
    isFavorite: false,
    folderId: "f1",
    userId,
    contactDetails: [
      { id: "cd-1", type: "PHONE", value: "010-1234-5678", label: null, cardId: "card-1" },
      { id: "cd-2", type: "EMAIL", value: "hong@samsung.com", label: null, cardId: "card-1" },
      { id: "cd-3", type: "FAX", value: "02-555-1234", label: null, cardId: "card-1" },
    ],
    folder: { id: "f1", name: "업무" },
    tags: [{ tag: { id: "t1", name: "VIP" } }],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

describe("ExportService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("exportVCard", () => {
    it("should generate vCard 3.0 format", async () => {
      vi.mocked(prisma.businessCard.findMany).mockResolvedValue(
        mockCards as any,
      );

      const result = await ExportService.exportVCard(userId, {
        scope: "all",
        version: "3.0",
      });

      expect(result).toContain("BEGIN:VCARD");
      expect(result).toContain("VERSION:3.0");
      expect(result).toContain("FN:홍길동");
      expect(result).toContain("ORG:삼성전자");
      expect(result).toContain("TITLE:개발자");
      expect(result).toContain("TEL;TYPE=WORK:010-1234-5678");
      expect(result).toContain("EMAIL;TYPE=INTERNET:hong@samsung.com");
      expect(result).toContain("TEL;TYPE=FAX:02-555-1234");
      expect(result).toContain("ADR;TYPE=WORK:;;서울시 강남구;;;;");
      expect(result).toContain("URL:https://samsung.com");
      expect(result).toContain("END:VCARD");
    });

    it("should generate vCard 4.0 format", async () => {
      vi.mocked(prisma.businessCard.findMany).mockResolvedValue(
        mockCards as any,
      );

      const result = await ExportService.exportVCard(userId, {
        scope: "all",
        version: "4.0",
      });

      expect(result).toContain("VERSION:4.0");
      expect(result).toContain(
        "TEL;TYPE=WORK;VALUE=uri:tel:010-1234-5678",
      );
      expect(result).toContain("EMAIL;TYPE=WORK:hong@samsung.com");
    });

    it("should include memo with escaped newlines", async () => {
      const cardsWithNewlineMemo = [
        {
          ...mockCards[0],
          memo: "첫 번째 줄\n두 번째 줄",
        },
      ];
      vi.mocked(prisma.businessCard.findMany).mockResolvedValue(
        cardsWithNewlineMemo as any,
      );

      const result = await ExportService.exportVCard(userId, {
        scope: "all",
        version: "3.0",
      });

      expect(result).toContain("NOTE:첫 번째 줄\\n두 번째 줄");
    });
  });

  describe("exportCsv", () => {
    it("should include UTF-8 BOM", async () => {
      vi.mocked(prisma.businessCard.findMany).mockResolvedValue(
        mockCards as any,
      );

      const result = await ExportService.exportCsv(userId, {
        scope: "all",
      });

      expect(result.startsWith("\uFEFF")).toBe(true);
    });

    it("should include header row", async () => {
      vi.mocked(prisma.businessCard.findMany).mockResolvedValue(
        mockCards as any,
      );

      const result = await ExportService.exportCsv(userId, {
        scope: "all",
      });

      const lines = result.replace("\uFEFF", "").split("\r\n");
      expect(lines[0]).toBe(
        "이름,회사,직함,전화번호,이메일,팩스,주소,웹사이트,메모,폴더,태그",
      );
    });

    it("should escape values with commas", async () => {
      const cardsWithComma = [
        {
          ...mockCards[0],
          company: "삼성전자, 반도체부문",
        },
      ];
      vi.mocked(prisma.businessCard.findMany).mockResolvedValue(
        cardsWithComma as any,
      );

      const result = await ExportService.exportCsv(userId, {
        scope: "all",
      });

      // Each value is wrapped in quotes, so commas inside are safe
      const lines = result.replace("\uFEFF", "").split("\r\n");
      const dataRow = lines[1];
      expect(dataRow).toContain('"삼성전자, 반도체부문"');
    });

    it("should include card data in correct columns", async () => {
      vi.mocked(prisma.businessCard.findMany).mockResolvedValue(
        mockCards as any,
      );

      const result = await ExportService.exportCsv(userId, {
        scope: "all",
      });

      const lines = result.replace("\uFEFF", "").split("\r\n");
      const dataRow = lines[1];
      expect(dataRow).toContain('"홍길동"');
      expect(dataRow).toContain('"삼성전자"');
      expect(dataRow).toContain('"개발자"');
      expect(dataRow).toContain('"010-1234-5678"');
      expect(dataRow).toContain('"hong@samsung.com"');
      expect(dataRow).toContain('"02-555-1234"');
      expect(dataRow).toContain('"서울시 강남구"');
      expect(dataRow).toContain('"https://samsung.com"');
      expect(dataRow).toContain('"메모"');
      expect(dataRow).toContain('"업무"');
      expect(dataRow).toContain('"VIP"');
    });
  });
});
