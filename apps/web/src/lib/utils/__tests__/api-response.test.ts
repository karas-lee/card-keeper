import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/server", () => {
  class MockNextResponse {
    body: any;
    status: number;
    constructor(body: any, init?: { status?: number }) {
      this.body = body;
      this.status = init?.status || 200;
    }
    static json = vi.fn(
      (data: any, init?: { status?: number }) => ({
        jsonBody: data,
        status: init?.status || 200,
      })
    );
  }
  return { NextResponse: MockNextResponse };
});

import {
  AppError,
  successResponse,
  paginatedResponse,
  errorResponse,
  noContentResponse,
} from "@/lib/utils/api-response";
import { NextResponse } from "next/server";

describe("AppError", () => {
  it("should create an error with correct code, message, and statusCode", () => {
    const error = new AppError("VALIDATION_ERROR", "Invalid input", 400);

    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.message).toBe("Invalid input");
    expect(error.statusCode).toBe(400);
  });

  it("should have the name 'AppError'", () => {
    const error = new AppError("NOT_FOUND", "Not found", 404);

    expect(error.name).toBe("AppError");
  });

  it("should include details when provided", () => {
    const details = [
      { field: "email", message: "Email is required" },
      { field: "name", message: "Name must be at least 1 character" },
    ];
    const error = new AppError("VALIDATION_ERROR", "Invalid input", 400, details);

    expect(error.details).toBeDefined();
    expect(error.details).toHaveLength(2);
    expect(error.details![0]).toEqual({ field: "email", message: "Email is required" });
    expect(error.details![1]).toEqual({ field: "name", message: "Name must be at least 1 character" });
  });

  it("should have undefined details when not provided", () => {
    const error = new AppError("INTERNAL_ERROR", "Server error", 500);

    expect(error.details).toBeUndefined();
  });

  it("should be an instance of Error", () => {
    const error = new AppError("UNAUTHORIZED", "Not authorized", 401);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });
});

describe("successResponse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return JSON with { data } and status 200 by default", () => {
    const data = { id: "1", name: "Test" };

    const result = successResponse(data);

    expect(NextResponse.json).toHaveBeenCalledWith({ data }, { status: 200 });
    expect(result).toEqual({
      jsonBody: { data },
      status: 200,
    });
  });

  it("should use a custom status code when provided", () => {
    const data = { id: "2", created: true };

    const result = successResponse(data, 201);

    expect(NextResponse.json).toHaveBeenCalledWith({ data }, { status: 201 });
    expect(result).toEqual({
      jsonBody: { data },
      status: 201,
    });
  });
});

describe("paginatedResponse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return JSON with { data, meta }", () => {
    const data = [{ id: "1" }, { id: "2" }];
    const meta = {
      nextCursor: "cursor-abc",
      hasMore: true,
      totalCount: 50,
    };

    const result = paginatedResponse(data, meta);

    expect(NextResponse.json).toHaveBeenCalledWith({ data, meta });
    expect(result).toEqual({
      jsonBody: { data, meta },
      status: 200,
    });
  });

  it("should include meta with nextCursor, hasMore, and totalCount", () => {
    const data = [{ id: "1" }];
    const meta = {
      nextCursor: null,
      hasMore: false,
      totalCount: 1,
    };

    const result = paginatedResponse(data, meta);

    expect(NextResponse.json).toHaveBeenCalledWith({
      data,
      meta: {
        nextCursor: null,
        hasMore: false,
        totalCount: 1,
      },
    });
  });

  it("should handle an empty data array", () => {
    const data: any[] = [];
    const meta = {
      nextCursor: null,
      hasMore: false,
      totalCount: 0,
    };

    const result = paginatedResponse(data, meta);

    expect(NextResponse.json).toHaveBeenCalledWith({ data: [], meta });
    expect(result).toEqual({
      jsonBody: { data: [], meta },
      status: 200,
    });
  });
});

describe("errorResponse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return JSON with { error: { code, message } } and provided status", () => {
    const result = errorResponse("NOT_FOUND", "Resource not found", 404);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: { code: "NOT_FOUND", message: "Resource not found", details: undefined } },
      { status: 404 }
    );
    expect(result).toEqual({
      jsonBody: { error: { code: "NOT_FOUND", message: "Resource not found", details: undefined } },
      status: 404,
    });
  });

  it("should include details when provided", () => {
    const details = [{ field: "email", message: "Invalid email format" }];

    const result = errorResponse("VALIDATION_ERROR", "Validation failed", 400, details);

    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details,
        },
      },
      { status: 400 }
    );
    expect(result).toEqual({
      jsonBody: {
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details,
        },
      },
      status: 400,
    });
  });

  it("should handle 500 internal server errors", () => {
    const result = errorResponse("INTERNAL_ERROR", "Something went wrong", 500);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: { code: "INTERNAL_ERROR", message: "Something went wrong", details: undefined } },
      { status: 500 }
    );
    expect(result.status).toBe(500);
  });
});

describe("noContentResponse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return status 204", () => {
    const result = noContentResponse();

    expect(result.status).toBe(204);
  });

  it("should have null body", () => {
    const result = noContentResponse();

    expect(result.body).toBeNull();
  });
});
