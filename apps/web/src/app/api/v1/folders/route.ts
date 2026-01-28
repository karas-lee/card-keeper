import { NextRequest } from "next/server";
import { FolderService } from "@/lib/services/folder.service";
import { successResponse } from "@/lib/utils/api-response";
import { validateBody } from "@/lib/middleware/validate";
import { authenticate } from "@/lib/middleware/auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { createFolderSchema } from "@cardkeeper/shared-utils";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await authenticate(req);
  const folders = await FolderService.list(auth.userId);
  return successResponse(folders);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await authenticate(req);
  const body = await validateBody(req, createFolderSchema);
  const folder = await FolderService.create(auth.userId, body);
  return successResponse(folder, 201);
});
