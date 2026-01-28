import { NextRequest } from "next/server";
import { FolderService } from "@/lib/services/folder.service";
import { successResponse, noContentResponse } from "@/lib/utils/api-response";
import { validateBody } from "@/lib/middleware/validate";
import { authenticate } from "@/lib/middleware/auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { updateFolderSchema } from "@cardkeeper/shared-utils";

export const PUT = withErrorHandler(
  async (
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    const auth = await authenticate(req);
    const { id } = await context.params;
    const body = await validateBody(req, updateFolderSchema);
    const folder = await FolderService.update(auth.userId, id, body);
    return successResponse(folder);
  }
);

export const DELETE = withErrorHandler(
  async (
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    const auth = await authenticate(req);
    const { id } = await context.params;
    await FolderService.delete(auth.userId, id);
    return noContentResponse();
  }
);
