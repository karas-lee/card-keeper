import { NextRequest } from "next/server";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "@/lib/utils/api-response";
import { ERROR_CODES } from "@cardkeeper/shared-constants";

export async function validateBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        "입력값이 올바르지 않습니다",
        400,
        error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }))
      );
    }
    throw error;
  }
}

export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): T {
  try {
    const params = Object.fromEntries(searchParams.entries());
    return schema.parse(params);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        "쿼리 파라미터가 올바르지 않습니다",
        400,
        error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }))
      );
    }
    throw error;
  }
}
