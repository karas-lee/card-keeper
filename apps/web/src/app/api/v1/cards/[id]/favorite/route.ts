import { NextRequest } from "next/server";
import { CardService } from "@/lib/services/card.service";
import { noContentResponse } from "@/lib/utils/api-response";
import { authenticate } from "@/lib/middleware/auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";

export const PATCH = withErrorHandler(
  async (
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    const auth = await authenticate(req);
    const { id } = await context.params;
    const { isFavorite } = await req.json();
    await CardService.toggleFavorite(auth.userId, id, isFavorite);
    return noContentResponse();
  }
);
