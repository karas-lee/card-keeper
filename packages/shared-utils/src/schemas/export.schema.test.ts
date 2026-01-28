import { describe, it, expect } from "vitest";
import { exportSchema } from "../schemas/export.schema";

describe("exportSchema", () => {
  it("should pass with scope 'all' without additional IDs", () => {
    const result = exportSchema.safeParse({ scope: "all" });
    expect(result.success).toBe(true);
  });

  it("should pass with scope 'selected' and cardIds provided", () => {
    const result = exportSchema.safeParse({
      scope: "selected",
      cardIds: ["clxxxxxxxxxxxxxxxxxxxxxxxxx"],
    });
    expect(result.success).toBe(true);
  });

  it("should fail with scope 'selected' without cardIds", () => {
    const result = exportSchema.safeParse({ scope: "selected" });
    expect(result.success).toBe(false);
  });

  it("should fail with scope 'selected' and empty cardIds array", () => {
    const result = exportSchema.safeParse({
      scope: "selected",
      cardIds: [],
    });
    expect(result.success).toBe(false);
  });

  it("should pass with scope 'folder' and folderId provided", () => {
    const result = exportSchema.safeParse({
      scope: "folder",
      folderId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
    });
    expect(result.success).toBe(true);
  });

  it("should fail with scope 'folder' without folderId", () => {
    const result = exportSchema.safeParse({ scope: "folder" });
    expect(result.success).toBe(false);
  });

  it("should pass with scope 'tag' and tagId provided", () => {
    const result = exportSchema.safeParse({
      scope: "tag",
      tagId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
    });
    expect(result.success).toBe(true);
  });

  it("should fail with scope 'tag' without tagId", () => {
    const result = exportSchema.safeParse({ scope: "tag" });
    expect(result.success).toBe(false);
  });

  it("should pass with scope 'single'", () => {
    const result = exportSchema.safeParse({ scope: "single" });
    expect(result.success).toBe(true);
  });

  it("should accept version '3.0'", () => {
    const result = exportSchema.safeParse({
      scope: "all",
      version: "3.0",
    });
    expect(result.success).toBe(true);
  });

  it("should accept version '4.0'", () => {
    const result = exportSchema.safeParse({
      scope: "all",
      version: "4.0",
    });
    expect(result.success).toBe(true);
  });

  it("should fail with invalid version", () => {
    const result = exportSchema.safeParse({
      scope: "all",
      version: "5.0",
    });
    expect(result.success).toBe(false);
  });

  it("should fail with invalid scope", () => {
    const result = exportSchema.safeParse({ scope: "invalid" });
    expect(result.success).toBe(false);
  });
});
