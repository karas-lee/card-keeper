import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/api-response";
import { ERROR_CODES } from "@cardkeeper/shared-constants";
import { ImageService } from "./image.service";
import { performOcr } from "@/lib/ocr/vision-client";
import { parseOcrText } from "@/lib/ocr/text-parser";

export class ScanService {
  static async uploadAndOcr(userId: string, imageBuffer: Buffer, filename: string) {
    // 1. Process and upload image
    const { imageUrl, thumbnailUrl } = await ImageService.processAndUpload(imageBuffer, userId, filename);

    // 2. Perform OCR
    const ocrResult = await performOcr(imageBuffer);

    // 3. Parse OCR text
    const parsed = parseOcrText(ocrResult.rawText);

    // 4. Store scan result
    const scanResult = await prisma.scanResult.create({
      data: {
        userId,
        imageUrl,
        thumbnailUrl,
        rawText: ocrResult.rawText,
        confidence: ocrResult.confidence,
        parsedData: parsed as any,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      },
    });

    return {
      scanId: scanResult.id,
      imageUrl,
      thumbnailUrl,
      ocrResult: {
        rawText: ocrResult.rawText,
        confidence: ocrResult.confidence,
        parsed,
      },
    };
  }

  static async confirm(userId: string, input: any) {
    const scanResult = await prisma.scanResult.findFirst({
      where: { id: input.scanId, userId, status: "PENDING" },
    });

    if (!scanResult) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "스캔 결과를 찾을 수 없습니다", 404);
    }

    if (scanResult.expiresAt < new Date()) {
      throw new AppError(ERROR_CODES.TOKEN_EXPIRED, "스캔 결과가 만료되었습니다", 410);
    }

    const { scanId, tagIds, contactDetails, ...cardData } = input;

    // Create business card from confirmed scan
    const card = await prisma.businessCard.create({
      data: {
        ...cardData,
        userId,
        imageUrl: scanResult.imageUrl,
        thumbnailUrl: scanResult.thumbnailUrl,
        ocrRawText: scanResult.rawText,
        ocrConfidence: scanResult.confidence,
        scanMethod: "OCR_GALLERY",
        ...(contactDetails?.length ? { contactDetails: { create: contactDetails } } : {}),
        ...(tagIds?.length ? { tags: { create: tagIds.map((tagId: string) => ({ tagId })) } } : {}),
      },
      include: {
        folder: { select: { id: true, name: true, color: true } },
        tags: { include: { tag: { select: { id: true, name: true, color: true } } } },
        contactDetails: true,
      },
    });

    // Mark scan as confirmed
    await prisma.scanResult.update({
      where: { id: scanId },
      data: { status: "CONFIRMED" },
    });

    return {
      ...card,
      tags: card.tags.map((ct: any) => ct.tag),
    };
  }
}
