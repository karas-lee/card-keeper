import { NextRequest } from "next/server";
import { CardService } from "@/lib/services/card.service";
import { noContentResponse } from "@/lib/utils/api-response";
import { authenticate } from "@/lib/middleware/auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";

export const DELETE = withErrorHandler(
  async (
    req: NextRequest,
    context: { params: Promise<{ id: string; tagId: string }> }
  ) => {
    const auth = await authenticate(req);
    const { id, tagId } = await context.params;
    await CardService.removeTag(auth.userId, id, tagId);
    return noContentResponse();
  }
);
