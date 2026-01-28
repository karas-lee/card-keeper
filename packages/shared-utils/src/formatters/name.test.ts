import { describe, it, expect } from "vitest";
import { formatDisplayName, getInitials } from "../formatters/name";

describe("formatDisplayName", () => {
  it("should return trimmed name when name is provided", () => {
    expect(formatDisplayName("홍길동")).toBe("홍길동");
  });

  it("should trim whitespace from name", () => {
    expect(formatDisplayName("  홍길동  ")).toBe("홍길동");
  });

  it("should return email username when name is null", () => {
    expect(formatDisplayName(null, "hong@example.com")).toBe("hong");
  });

  it("should return email username when name is undefined", () => {
    expect(formatDisplayName(undefined, "hong@example.com")).toBe("hong");
  });

  it("should return email username when name is empty string", () => {
    expect(formatDisplayName("", "hong@example.com")).toBe("hong");
  });

  it("should return email username when name is only whitespace", () => {
    expect(formatDisplayName("   ", "user@test.com")).toBe("user");
  });

  it("should return '사용자' when both name and email are absent", () => {
    expect(formatDisplayName(null)).toBe("사용자");
  });

  it("should return '사용자' when name is null and email is null", () => {
    expect(formatDisplayName(null, null)).toBe("사용자");
  });

  it("should return '사용자' when name is undefined and email is undefined", () => {
    expect(formatDisplayName(undefined, undefined)).toBe("사용자");
  });

  it("should prefer name over email", () => {
    expect(formatDisplayName("홍길동", "hong@example.com")).toBe("홍길동");
  });
});

describe("getInitials", () => {
  it("should return first 2 characters for Korean name", () => {
    expect(getInitials("홍길동")).toBe("홍길");
  });

  it("should return first letters of each word for English name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("should return uppercase initials for English name", () => {
    expect(getInitials("john doe")).toBe("JD");
  });

  it("should return uppercase slice for single English word", () => {
    expect(getInitials("john")).toBe("JO");
  });

  it("should return '?' for null name", () => {
    expect(getInitials(null)).toBe("?");
  });

  it("should return '?' for undefined name", () => {
    expect(getInitials(undefined)).toBe("?");
  });

  it("should return '?' for empty string", () => {
    expect(getInitials("")).toBe("?");
  });

  it("should return '?' for whitespace-only string", () => {
    expect(getInitials("   ")).toBe("?");
  });

  it("should respect maxLength parameter", () => {
    expect(getInitials("John Michael Doe", 3)).toBe("JMD");
  });

  it("should handle multi-word name with default maxLength of 2", () => {
    expect(getInitials("John Michael Doe")).toBe("JM");
  });

  it("should handle Korean two-character name", () => {
    expect(getInitials("김철")).toBe("김철");
  });
});
