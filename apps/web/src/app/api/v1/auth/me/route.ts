import { NextRequest } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { successResponse } from "@/lib/utils/api-response";
import { authenticate } from "@/lib/middleware/auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await authenticate(req);
  const user = await AuthService.getMe(auth.userId);
  return successResponse(user);
});
