import { NextRequest } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { noContentResponse } from "@/lib/utils/api-response";
import { validateBody } from "@/lib/middleware/validate";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { resetPasswordSchema } from "@cardkeeper/shared-utils";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await validateBody(req, resetPasswordSchema);
  await AuthService.resetPassword(body.token, body.password);
  return noContentResponse();
});
