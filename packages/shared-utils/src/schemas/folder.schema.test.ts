import { describe, it, expect } from "vitest";
import {
  createFolderSchema,
  updateFolderSchema,
} from "../schemas/folder.schema";

describe("createFolderSchema", () => {
  it("should pass with valid name only (color defaults to #6366F1)", () => {
    const result = createFolderSchema.safeParse({ name: "업무" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.color).toBe("#6366F1");
    }
  });

  it("should pass with valid name and custom color", () => {
    const result = createFolderSchema.safeParse({
      name: "개인",
      color: "#FF5733",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.color).toBe("#FF5733");
    }
  });

  it("should fail when name is empty", () => {
    const result = createFolderSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("should fail when name is missing", () => {
    const result = createFolderSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should fail when name exceeds 50 characters", () => {
    const result = createFolderSchema.safeParse({
      name: "a".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("should pass when name is exactly 50 characters", () => {
    const result = createFolderSchema.safeParse({
      name: "a".repeat(50),
    });
    expect(result.success).toBe(true);
  });

  it("should fail when color is not a valid hex", () => {
    const result = createFolderSchema.safeParse({
      name: "업무",
      color: "red",
    });
    expect(result.success).toBe(false);
  });

  it("should fail when color is missing # prefix", () => {
    const result = createFolderSchema.safeParse({
      name: "업무",
      color: "6366F1",
    });
    expect(result.success).toBe(false);
  });

  it("should fail when color has invalid hex characters", () => {
    const result = createFolderSchema.safeParse({
      name: "업무",
      color: "#GGGGGG",
    });
    expect(result.success).toBe(false);
  });

  it("should accept parentId as optional cuid", () => {
    const result = createFolderSchema.safeParse({
      name: "업무",
      parentId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
    });
    expect(result.success).toBe(true);
  });

  it("should accept parentId as null", () => {
    const result = createFolderSchema.safeParse({
      name: "업무",
      parentId: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("updateFolderSchema", () => {
  it("should pass with only name", () => {
    const result = updateFolderSchema.safeParse({ name: "새 이름" });
    expect(result.success).toBe(true);
  });

  it("should pass with only color", () => {
    const result = updateFolderSchema.safeParse({ color: "#FF5733" });
    expect(result.success).toBe(true);
  });

  it("should pass with only order", () => {
    const result = updateFolderSchema.safeParse({ order: 0 });
    expect(result.success).toBe(true);
  });

  it("should pass with empty object (all fields optional)", () => {
    const result = updateFolderSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should fail when name is empty string", () => {
    const result = updateFolderSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("should fail when color is invalid hex", () => {
    const result = updateFolderSchema.safeParse({ color: "invalid" });
    expect(result.success).toBe(false);
  });

  it("should fail when order is negative", () => {
    const result = updateFolderSchema.safeParse({ order: -1 });
    expect(result.success).toBe(false);
  });

  it("should fail when order is not an integer", () => {
    const result = updateFolderSchema.safeParse({ order: 1.5 });
    expect(result.success).toBe(false);
  });

  it("should pass when order is 0", () => {
    const result = updateFolderSchema.safeParse({ order: 0 });
    expect(result.success).toBe(true);
  });

  it("should pass with all fields provided", () => {
    const result = updateFolderSchema.safeParse({
      name: "업무",
      color: "#6366F1",
      order: 3,
    });
    expect(result.success).toBe(true);
  });
});
