import { NextRequest } from "next/server";
import { TagService } from "@/lib/services/tag.service";
import { successResponse, noContentResponse } from "@/lib/utils/api-response";
import { validateBody } from "@/lib/middleware/validate";
import { authenticate } from "@/lib/middleware/auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { updateTagSchema } from "@cardkeeper/shared-utils";

export const PUT = withErrorHandler(
  async (
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    const auth = await authenticate(req);
    const { id } = await context.params;
    const body = await validateBody(req, updateTagSchema);
    const tag = await TagService.update(auth.userId, id, body);
    return successResponse(tag);
  }
);

export const DELETE = withErrorHandler(
  async (
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    const auth = await authenticate(req);
    const { id } = await context.params;
    await TagService.delete(auth.userId, id);
    return noContentResponse();
  }
);
