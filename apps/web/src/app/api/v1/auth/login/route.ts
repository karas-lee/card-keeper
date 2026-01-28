import { NextRequest } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { successResponse } from "@/lib/utils/api-response";
import { validateBody } from "@/lib/middleware/validate";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { loginSchema } from "@cardkeeper/shared-utils";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await validateBody(req, loginSchema);
  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    undefined;
  const result = await AuthService.login(body, ipAddress);
  return successResponse(result);
});
