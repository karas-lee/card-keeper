import { NextResponse } from "next/server";

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
    public details?: Array<{ field?: string; message: string }>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function paginatedResponse<T>(
  data: T[],
  meta: { nextCursor: string | null; hasMore: boolean; totalCount: number }
) {
  return NextResponse.json({ data, meta });
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: Array<{ field?: string; message: string }>
) {
  return NextResponse.json({ error: { code, message, details } }, { status });
}

export function noContentResponse() {
  return new NextResponse(null, { status: 204 });
}
