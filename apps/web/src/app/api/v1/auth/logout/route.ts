import { NextRequest } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { noContentResponse } from "@/lib/utils/api-response";
import { authenticate } from "@/lib/middleware/auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";

export const POST = withErrorHandler(async (req: NextRequest) => {
  await authenticate(req);
  const { refreshToken } = await req.json();
  await AuthService.logout(refreshToken);
  return noContentResponse();
});
