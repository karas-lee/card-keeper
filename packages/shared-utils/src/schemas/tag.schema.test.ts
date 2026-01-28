import { describe, it, expect } from "vitest";
import { createTagSchema, updateTagSchema } from "../schemas/tag.schema";

describe("createTagSchema", () => {
  it("should pass with valid name only (color defaults to #8B5CF6)", () => {
    const result = createTagSchema.safeParse({ name: "중요" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.color).toBe("#8B5CF6");
    }
  });

  it("should pass with valid name and custom color", () => {
    const result = createTagSchema.safeParse({
      name: "긴급",
      color: "#EF4444",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.color).toBe("#EF4444");
    }
  });

  it("should fail when name is empty", () => {
    const result = createTagSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("should fail when name is missing", () => {
    const result = createTagSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should fail when name exceeds 30 characters", () => {
    const result = createTagSchema.safeParse({
      name: "a".repeat(31),
    });
    expect(result.success).toBe(false);
  });

  it("should pass when name is exactly 30 characters", () => {
    const result = createTagSchema.safeParse({
      name: "a".repeat(30),
    });
    expect(result.success).toBe(true);
  });

  it("should fail when color is not valid hex", () => {
    const result = createTagSchema.safeParse({
      name: "중요",
      color: "blue",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateTagSchema", () => {
  it("should pass with only name", () => {
    const result = updateTagSchema.safeParse({ name: "새 태그" });
    expect(result.success).toBe(true);
  });

  it("should pass with only color", () => {
    const result = updateTagSchema.safeParse({ color: "#EF4444" });
    expect(result.success).toBe(true);
  });

  it("should pass with empty object (all fields optional)", () => {
    const result = updateTagSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should fail when name is empty string", () => {
    const result = updateTagSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("should fail when color is invalid hex", () => {
    const result = updateTagSchema.safeParse({ color: "not-hex" });
    expect(result.success).toBe(false);
  });

  it("should pass with both name and color", () => {
    const result = updateTagSchema.safeParse({
      name: "업데이트",
      color: "#10B981",
    });
    expect(result.success).toBe(true);
  });
});
