import { NextRequest } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { successResponse } from "@/lib/utils/api-response";
import { withErrorHandler } from "@/lib/middleware/error-handler";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const { refreshToken } = await req.json();
  const result = await AuthService.refreshTokens(refreshToken);
  return successResponse(result);
});
