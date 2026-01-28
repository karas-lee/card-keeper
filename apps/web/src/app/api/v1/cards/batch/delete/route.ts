import { NextRequest } from "next/server";
import { CardService } from "@/lib/services/card.service";
import { noContentResponse } from "@/lib/utils/api-response";
import { validateBody } from "@/lib/middleware/validate";
import { authenticate } from "@/lib/middleware/auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { batchDeleteSchema } from "@cardkeeper/shared-utils";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await authenticate(req);
  const body = await validateBody(req, batchDeleteSchema);
  await CardService.batchDelete(auth.userId, body.cardIds);
  return noContentResponse();
});
