import { describe, it, expect } from "vitest";
import { isValidUrl } from "../validators/url";

describe("isValidUrl", () => {
  it("should return true for https URL", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
  });

  it("should return true for http URL", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
  });

  it("should return true for URL with www prefix (auto-prepends https)", () => {
    expect(isValidUrl("www.example.com")).toBe(true);
  });

  it("should return true for URL with path", () => {
    expect(isValidUrl("https://example.com/path/to/page")).toBe(true);
  });

  it("should return true for URL with query string", () => {
    expect(isValidUrl("https://example.com?q=test")).toBe(true);
  });

  it("should return true for domain without protocol (auto-prepends https)", () => {
    expect(isValidUrl("example.com")).toBe(true);
  });

  it("should return false for random text", () => {
    expect(isValidUrl("not a url")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isValidUrl("")).toBe(false);
  });
});
