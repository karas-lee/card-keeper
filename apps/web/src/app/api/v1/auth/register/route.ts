import { NextRequest } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { successResponse } from "@/lib/utils/api-response";
import { validateBody } from "@/lib/middleware/validate";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { registerSchema } from "@cardkeeper/shared-utils";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await validateBody(req, registerSchema);
  const result = await AuthService.register(body);
  return successResponse(result, 201);
});
