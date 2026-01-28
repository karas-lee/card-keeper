import { NextRequest } from "next/server";
import { ScanService } from "@/lib/services/scan.service";
import { successResponse } from "@/lib/utils/api-response";
import { AppError } from "@/lib/utils/api-response";
import { authenticate } from "@/lib/middleware/auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { LIMITS, CONFIG, ERROR_CODES } from "@cardkeeper/shared-constants";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await authenticate(req);

  const formData = await req.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, "이미지 파일이 필요합니다", 400);
  }

  // Validate file type
  if (!CONFIG.SUPPORTED_IMAGE_TYPES.includes(file.type as any)) {
    throw new AppError(
      ERROR_CODES.UNSUPPORTED_FORMAT,
      "지원하지 않는 이미지 형식입니다",
      400
    );
  }

  // Validate file size
  if (file.size > LIMITS.MAX_IMAGE_SIZE) {
    throw new AppError(
      ERROR_CODES.FILE_TOO_LARGE,
      "이미지 크기는 10MB 이하여야 합니다",
      400
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const result = await ScanService.uploadAndOcr(auth.userId, buffer, file.name);

  return successResponse(result);
});
