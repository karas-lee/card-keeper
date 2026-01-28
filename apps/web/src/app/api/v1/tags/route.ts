import { NextRequest } from "next/server";
import { TagService } from "@/lib/services/tag.service";
import { successResponse } from "@/lib/utils/api-response";
import { validateBody } from "@/lib/middleware/validate";
import { authenticate } from "@/lib/middleware/auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import { createTagSchema } from "@cardkeeper/shared-utils";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await authenticate(req);
  const tags = await TagService.list(auth.userId);
  return successResponse(tags);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await authenticate(req);
  const body = await validateBody(req, createTagSchema);
  const tag = await TagService.create(auth.userId, body);
  return successResponse(tag, 201);
});
