import { describe, it, expect } from "vitest";
import { isValidPhone, isKoreanMobile } from "../validators/phone";

describe("isValidPhone", () => {
  it("should return true for Korean mobile with dashes", () => {
    expect(isValidPhone("010-1234-5678")).toBe(true);
  });

  it("should return true for Seoul landline with dashes", () => {
    expect(isValidPhone("02-1234-5678")).toBe(true);
  });

  it("should return true for Seoul 9-digit landline", () => {
    expect(isValidPhone("02-123-4567")).toBe(true);
  });

  it("should return true for regional number", () => {
    expect(isValidPhone("031-123-4567")).toBe(true);
  });

  it("should return true for number with +82 prefix", () => {
    expect(isValidPhone("+82-10-1234-5678")).toBe(true);
  });

  it("should return true for number with +82 no dash after country code", () => {
    expect(isValidPhone("+8210-1234-5678")).toBe(true);
  });

  it("should return false for random text", () => {
    expect(isValidPhone("not a phone")).toBe(false);
  });

  it("should return false for too-short number", () => {
    expect(isValidPhone("123")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isValidPhone("")).toBe(false);
  });
});

describe("isKoreanMobile", () => {
  it("should return true for 010 number", () => {
    expect(isKoreanMobile("010-1234-5678")).toBe(true);
  });

  it("should return true for 011 number", () => {
    expect(isKoreanMobile("011-123-4567")).toBe(true);
  });

  it("should return true for 016 number", () => {
    expect(isKoreanMobile("016-123-4567")).toBe(true);
  });

  it("should return true for 017 number", () => {
    expect(isKoreanMobile("017-123-4567")).toBe(true);
  });

  it("should return true for 018 number", () => {
    expect(isKoreanMobile("018-123-4567")).toBe(true);
  });

  it("should return true for 019 number", () => {
    expect(isKoreanMobile("019-123-4567")).toBe(true);
  });

  it("should return false for Seoul landline (02)", () => {
    expect(isKoreanMobile("02-1234-5678")).toBe(false);
  });

  it("should return false for regional landline (031)", () => {
    expect(isKoreanMobile("031-123-4567")).toBe(false);
  });

  it("should return true for number without dashes", () => {
    expect(isKoreanMobile("01012345678")).toBe(true);
  });

  it("should return false for number with +82 prefix (digits become 82010...)", () => {
    // After stripping non-digits, "+82-010-1234-5678" becomes "8201012345678"
    // which does not start with any Korean mobile prefix
    expect(isKoreanMobile("+82-010-1234-5678")).toBe(false);
  });
});
