import { describe, it, expect, vi, beforeEach } from "vitest";
import { ScanService } from "@/lib/services/scan.service";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/api-response";
import { ERROR_CODES } from "@cardkeeper/shared-constants";

vi.mock("@/lib/services/image.service", () => ({
  ImageService: {
    processAndUpload: vi.fn().mockResolvedValue({
      imageUrl: "https://s3/img.jpg",
      thumbnailUrl: "https://s3/thumb.jpg",
    }),
  },
}));

vi.mock("@/lib/ocr/vision-client", () => ({
  performOcr: vi.fn().mockResolvedValue({
    rawText: "홍길동\n삼성전자\nhong@samsung.com",
    confidence: 0.95,
  }),
}));

vi.mock("@/lib/ocr/text-parser", () => ({
  parseOcrText: vi.fn().mockReturnValue({
    name: "홍길동",
    company: "삼성전자",
    contactDetails: [{ type: "EMAIL", value: "hong@samsung.com" }],
  }),
}));

const userId = "user-1";

const mockScanResult = {
  id: "scan-1",
  userId,
  imageUrl: "https://s3/img.jpg",
  thumbnailUrl: "https://s3/thumb.jpg",
  rawText: "홍길동\n삼성전자\nhong@samsung.com",
  confidence: 0.95,
  parsedData: {
    name: "홍길동",
    company: "삼성전자",
    contactDetails: [{ type: "EMAIL", value: "hong@samsung.com" }],
  },
  status: "PENDING",
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("ScanService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Add scanResult mock since it's not in setup.ts
    (prisma as any).scanResult = {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    };
  });

  describe("uploadAndOcr", () => {
    it("should process image, perform OCR, and store scan result", async () => {
      (prisma as any).scanResult.create.mockResolvedValue(mockScanResult);

      const buffer = Buffer.from("fake-image-data");
      const result = await ScanService.uploadAndOcr(
        userId,
        buffer,
        "card.jpg",
      );

      expect(result.scanId).toBe("scan-1");
      expect(result.imageUrl).toBe("https://s3/img.jpg");
      expect(result.thumbnailUrl).toBe("https://s3/thumb.jpg");
      expect(result.ocrResult.rawText).toBe(
        "홍길동\n삼성전자\nhong@samsung.com",
      );
      expect(result.ocrResult.confidence).toBe(0.95);
      expect(result.ocrResult.parsed.name).toBe("홍길동");

      const { ImageService } = await import("@/lib/services/image.service");
      expect(ImageService.processAndUpload).toHaveBeenCalledWith(
        buffer,
        userId,
        "card.jpg",
      );

      const { performOcr } = await import("@/lib/ocr/vision-client");
      expect(performOcr).toHaveBeenCalledWith(buffer);

      expect((prisma as any).scanResult.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId,
            imageUrl: "https://s3/img.jpg",
            thumbnailUrl: "https://s3/thumb.jpg",
            rawText: "홍길동\n삼성전자\nhong@samsung.com",
            confidence: 0.95,
            status: "PENDING",
          }),
        }),
      );
    });
  });

  describe("confirm", () => {
    it("should create a card from scan result", async () => {
      (prisma as any).scanResult.findFirst.mockResolvedValue(mockScanResult);

      const mockCard = {
        id: "card-1",
        userId,
        name: "홍길동",
        company: "삼성전자",
        imageUrl: "https://s3/img.jpg",
        thumbnailUrl: "https://s3/thumb.jpg",
        folder: { id: "f1", name: "업무", color: "#6366F1" },
        tags: [{ tag: { id: "t1", name: "VIP", color: "#8B5CF6" } }],
        contactDetails: [
          { type: "EMAIL", value: "hong@samsung.com" },
        ],
      };
      vi.mocked(prisma.businessCard.create).mockResolvedValue(
        mockCard as any,
      );
      (prisma as any).scanResult.update.mockResolvedValue({});

      const input = {
        scanId: "scan-1",
        name: "홍길동",
        company: "삼성전자",
        folderId: "f1",
        contactDetails: [{ type: "EMAIL", value: "hong@samsung.com" }],
        tagIds: ["t1"],
      };

      const result = await ScanService.confirm(userId, input);

      expect(result.name).toBe("홍길동");
      expect(result.tags).toEqual([
        { id: "t1", name: "VIP", color: "#8B5CF6" },
      ]);
      expect(prisma.businessCard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: "홍길동",
            company: "삼성전자",
            userId,
            imageUrl: "https://s3/img.jpg",
            thumbnailUrl: "https://s3/thumb.jpg",
            ocrRawText: mockScanResult.rawText,
            ocrConfidence: mockScanResult.confidence,
            scanMethod: "OCR_GALLERY",
          }),
        }),
      );
      expect((prisma as any).scanResult.update).toHaveBeenCalledWith({
        where: { id: "scan-1" },
        data: { status: "CONFIRMED" },
      });
    });

    it("should throw 404 when scan result is not found", async () => {
      (prisma as any).scanResult.findFirst.mockResolvedValue(null);

      try {
        await ScanService.confirm(userId, { scanId: "nonexistent" });
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ERROR_CODES.NOT_FOUND);
        expect((error as AppError).statusCode).toBe(404);
      }
    });

    it("should throw 410 when scan result is expired", async () => {
      const expiredScan = {
        ...mockScanResult,
        expiresAt: new Date(Date.now() - 1000), // expired
      };
      (prisma as any).scanResult.findFirst.mockResolvedValue(expiredScan);

      try {
        await ScanService.confirm(userId, { scanId: "scan-1" });
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ERROR_CODES.TOKEN_EXPIRED);
        expect((error as AppError).statusCode).toBe(410);
      }
    });
  });
});
