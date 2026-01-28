import { describe, it, expect } from "vitest";
import {
  createCardSchema,
  cardListQuerySchema,
} from "../schemas/card.schema";

describe("createCardSchema", () => {
  const validData = {
    name: "홍길동",
  };

  it("should pass with valid minimal data", () => {
    const result = createCardSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should pass with all optional fields", () => {
    const result = createCardSchema.safeParse({
      name: "홍길동",
      company: "테스트 회사",
      jobTitle: "개발자",
      address: "서울시 강남구",
      website: "https://example.com",
      memo: "메모 내용",
      folderId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      tagIds: ["clxxxxxxxxxxxxxxxxxxxxxxxxx"],
      contactDetails: [
        { type: "PHONE", value: "010-1234-5678", isPrimary: true },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should fail when name is empty", () => {
    const result = createCardSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("should fail when name is missing", () => {
    const result = createCardSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should fail when name exceeds 100 characters", () => {
    const result = createCardSchema.safeParse({
      name: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("should pass when name is exactly 100 characters", () => {
    const result = createCardSchema.safeParse({
      name: "a".repeat(100),
    });
    expect(result.success).toBe(true);
  });

  it("should fail when memo exceeds 2000 characters", () => {
    const result = createCardSchema.safeParse({
      name: "홍길동",
      memo: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("should pass when memo is exactly 2000 characters", () => {
    const result = createCardSchema.safeParse({
      name: "홍길동",
      memo: "a".repeat(2000),
    });
    expect(result.success).toBe(true);
  });

  it("should fail when tagIds exceeds 10 items", () => {
    const result = createCardSchema.safeParse({
      name: "홍길동",
      tagIds: Array(11).fill("clxxxxxxxxxxxxxxxxxxxxxxxxx"),
    });
    expect(result.success).toBe(false);
  });

  it("should pass when tagIds has exactly 10 items", () => {
    const result = createCardSchema.safeParse({
      name: "홍길동",
      tagIds: Array(10).fill("clxxxxxxxxxxxxxxxxxxxxxxxxx"),
    });
    expect(result.success).toBe(true);
  });

  it("should fail when contactDetails type is invalid", () => {
    const result = createCardSchema.safeParse({
      name: "홍길동",
      contactDetails: [{ type: "INVALID", value: "test" }],
    });
    expect(result.success).toBe(false);
  });

  it("should pass with valid contactDetails type enum values", () => {
    const types = ["PHONE", "EMAIL", "FAX", "MOBILE", "OTHER"] as const;
    for (const type of types) {
      const result = createCardSchema.safeParse({
        name: "홍길동",
        contactDetails: [{ type, value: "test-value" }],
      });
      expect(result.success).toBe(true);
    }
  });

  it("should fail when website is not a valid URL", () => {
    const result = createCardSchema.safeParse({
      name: "홍길동",
      website: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("should pass when website is a valid URL", () => {
    const result = createCardSchema.safeParse({
      name: "홍길동",
      website: "https://example.com",
    });
    expect(result.success).toBe(true);
  });

  it("should pass when website is empty string", () => {
    const result = createCardSchema.safeParse({
      name: "홍길동",
      website: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("cardListQuerySchema", () => {
  it("should apply defaults when parsing empty object", () => {
    const result = cardListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(20);
      expect(result.data.sort).toBe("createdAt");
      expect(result.data.order).toBe("desc");
    }
  });

  it("should accept valid limit within range", () => {
    const result = cardListQuerySchema.safeParse({ limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(50);
    }
  });

  it("should accept limit of 1 (minimum)", () => {
    const result = cardListQuerySchema.safeParse({ limit: 1 });
    expect(result.success).toBe(true);
  });

  it("should accept limit of 100 (maximum)", () => {
    const result = cardListQuerySchema.safeParse({ limit: 100 });
    expect(result.success).toBe(true);
  });

  it("should fail when limit is 0", () => {
    const result = cardListQuerySchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("should fail when limit exceeds 100", () => {
    const result = cardListQuerySchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it("should accept valid sort values", () => {
    const sortValues = ["name", "createdAt", "updatedAt", "company"] as const;
    for (const sort of sortValues) {
      const result = cardListQuerySchema.safeParse({ sort });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sort).toBe(sort);
      }
    }
  });

  it("should fail with invalid sort value", () => {
    const result = cardListQuerySchema.safeParse({ sort: "invalid" });
    expect(result.success).toBe(false);
  });

  it("should accept valid order values", () => {
    for (const order of ["asc", "desc"]) {
      const result = cardListQuerySchema.safeParse({ order });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.order).toBe(order);
      }
    }
  });

  it("should fail with invalid order value", () => {
    const result = cardListQuerySchema.safeParse({ order: "invalid" });
    expect(result.success).toBe(false);
  });

  it("should coerce string limit to number", () => {
    const result = cardListQuerySchema.safeParse({ limit: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(50);
    }
  });
});
