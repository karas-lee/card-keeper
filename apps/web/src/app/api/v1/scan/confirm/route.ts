import { NextRequest } from "next/server";
import { ScanService } from "@/lib/services/scan.service";
import { successResponse } from "@/lib/utils/api-response";
import { authenticate } from "@/lib/middleware/auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { validateBody } from "@/lib/middleware/validate";
import { scanConfirmSchema } from "@cardkeeper/shared-utils";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await authenticate(req);
  const body = await validateBody(req, scanConfirmSchema);
  const card = await ScanService.confirm(auth.userId, body);
  return successResponse(card, 201);
});
