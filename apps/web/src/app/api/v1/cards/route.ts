import { NextRequest } from "next/server";
import { CardService } from "@/lib/services/card.service";
import { successResponse, paginatedResponse } from "@/lib/utils/api-response";
import { validateBody, validateQuery } from "@/lib/middleware/validate";
import { authenticate } from "@/lib/middleware/auth";
import { withErrorHandler } from "@/lib/middleware/error-handler";
import {
  createCardSchema,
  cardListQuerySchema,
} from "@cardkeeper/shared-utils";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const auth = await authenticate(req);
  const query = validateQuery(req.nextUrl.searchParams, cardListQuerySchema);
  const result = await CardService.list(auth.userId, query);
  return paginatedResponse(result.data, result.meta);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await authenticate(req);
  const body = await validateBody(req, createCardSchema);
  const card = await CardService.create(auth.userId, body);
  return successResponse(card, 201);
});
