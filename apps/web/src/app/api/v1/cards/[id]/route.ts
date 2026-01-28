import { NextRequest } from "next/server";
import { CardService } from "@/lib/services/card.service";
import { successResponse, noContentResponse } from "@/lib/utils/api-response";
import { validateBody } from "@/lib/middleware/validate";
import { authenticate } from "@/lib/middleware/auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { updateCardSchema } from "@cardkeeper/shared-utils";

export const GET = withErrorHandler(
  async (
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    const auth = await authenticate(req);
    const { id } = await context.params;
    const card = await CardService.getById(auth.userId, id);
    return successResponse(card);
  }
);

export const PUT = withErrorHandler(
  async (
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    const auth = await authenticate(req);
    const { id } = await context.params;
    const body = await validateBody(req, updateCardSchema);
    const card = await CardService.update(auth.userId, id, body);
    return successResponse(card);
  }
);

export const DELETE = withErrorHandler(
  async (
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    const auth = await authenticate(req);
    const { id } = await context.params;
    await CardService.delete(auth.userId, id);
    return noContentResponse();
  }
);
