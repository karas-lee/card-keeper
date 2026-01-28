import { NextRequest } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { noContentResponse } from "@/lib/utils/api-response";
import { withErrorHandler } from "@/lib/middleware/error-handler";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const { token } = await req.json();
  await AuthService.verifyEmail(token);
  return noContentResponse();
});
