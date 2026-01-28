import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { z } from "zod";
import { validateBody, validateQuery } from "@/lib/middleware/validate";
import { AppError } from "@/lib/utils/api-response";

function createMockRequest(body: any): NextRequest {
  return {
    json: vi.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
}

function createFailingMockRequest(error: Error): NextRequest {
  return {
    json: vi.fn().mockRejectedValue(error),
  } as unknown as NextRequest;
}

describe("validateBody", () => {
  const schema = z.object({
    name: z.string().min(1),
    age: z.number().int().positive(),
  });

  it("should return parsed data when body matches schema", async () => {
    const req = createMockRequest({ name: "Alice", age: 30 });

    const result = await validateBody(req, schema);

    expect(result).toEqual({ name: "Alice", age: 30 });
  });

  it("should throw AppError with VALIDATION_ERROR code when body is invalid", async () => {
    const req = createMockRequest({ name: "", age: -5 });

    await expect(validateBody(req, schema)).rejects.toThrow(AppError);

    try {
      await validateBody(req, schema);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      const appError = error as AppError;
      expect(appError.code).toBe("VALIDATION_ERROR");
      expect(appError.statusCode).toBe(400);
    }
  });

  it("should include field-level details in AppError", async () => {
    const req = createMockRequest({ name: "", age: -5 });

    try {
      await validateBody(req, schema);
    } catch (error) {
      const appError = error as AppError;
      expect(appError.details).toBeDefined();
      expect(Array.isArray(appError.details)).toBe(true);
      expect(appError.details!.length).toBeGreaterThan(0);

      const fields = appError.details!.map((d) => d.field);
      expect(fields).toContain("name");
    }
  });

  it("should throw AppError when body has missing required fields", async () => {
    const req = createMockRequest({});

    await expect(validateBody(req, schema)).rejects.toThrow(AppError);

    try {
      await validateBody(req, schema);
    } catch (error) {
      const appError = error as AppError;
      expect(appError.code).toBe("VALIDATION_ERROR");
      expect(appError.statusCode).toBe(400);
      expect(appError.details).toBeDefined();
      expect(appError.details!.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("should throw when req.json() fails (non-JSON body)", async () => {
    const jsonError = new SyntaxError("Unexpected token");
    const req = createFailingMockRequest(jsonError);

    await expect(validateBody(req, schema)).rejects.toThrow(SyntaxError);
  });

  it("should throw AppError when body has wrong types", async () => {
    const req = createMockRequest({ name: 123, age: "not-a-number" });

    await expect(validateBody(req, schema)).rejects.toThrow(AppError);

    try {
      await validateBody(req, schema);
    } catch (error) {
      const appError = error as AppError;
      expect(appError.code).toBe("VALIDATION_ERROR");
      expect(appError.statusCode).toBe(400);
    }
  });
});

describe("validateQuery", () => {
  const schema = z.object({
    name: z.string().min(1),
    age: z.coerce.number(),
  });

  it("should return parsed data when query params match schema", () => {
    const params = new URLSearchParams({ name: "Bob", age: "25" });

    const result = validateQuery(params, schema);

    expect(result).toEqual({ name: "Bob", age: 25 });
  });

  it("should coerce string values to the correct types", () => {
    const params = new URLSearchParams({ name: "Carol", age: "42" });

    const result = validateQuery(params, schema);

    expect(typeof result.age).toBe("number");
    expect(result.age).toBe(42);
  });

  it("should throw AppError with VALIDATION_ERROR code when params are invalid", () => {
    const params = new URLSearchParams({ name: "", age: "abc" });

    expect(() => validateQuery(params, schema)).toThrow(AppError);

    try {
      validateQuery(params, schema);
    } catch (error) {
      const appError = error as AppError;
      expect(appError.code).toBe("VALIDATION_ERROR");
      expect(appError.statusCode).toBe(400);
    }
  });

  it("should include field-level details when query params fail validation", () => {
    const params = new URLSearchParams({ name: "" });

    try {
      validateQuery(params, schema);
    } catch (error) {
      const appError = error as AppError;
      expect(appError.details).toBeDefined();
      expect(Array.isArray(appError.details)).toBe(true);

      const fields = appError.details!.map((d) => d.field);
      expect(fields).toContain("name");
    }
  });

  it("should throw AppError when required params are missing", () => {
    const params = new URLSearchParams();

    expect(() => validateQuery(params, schema)).toThrow(AppError);

    try {
      validateQuery(params, schema);
    } catch (error) {
      const appError = error as AppError;
      expect(appError.code).toBe("VALIDATION_ERROR");
      expect(appError.statusCode).toBe(400);
      expect(appError.details).toBeDefined();
    }
  });
});
