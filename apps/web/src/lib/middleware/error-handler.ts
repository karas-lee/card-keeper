import { NextRequest, NextResponse } from "next/server";
import { AppError, errorResponse } from "@/lib/utils/api-response";
import { ERROR_CODES } from "@cardkeeper/shared-constants";

type RouteHandler = (
  req: NextRequest,
  context?: any
) => Promise<NextResponse | Response>;

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(
          error.code,
          error.message,
          error.statusCode,
          error.details
        );
      }

      console.error("Unhandled error:", error);
      return errorResponse(
        ERROR_CODES.INTERNAL_ERROR,
        "서버 오류가 발생했습니다",
        500
      );
    }
  };
}
