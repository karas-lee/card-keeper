import { describe, it, expect } from "vitest";
import { formatPhoneNumber } from "../formatters/phone";

describe("formatPhoneNumber", () => {
  describe("Korean locale (default)", () => {
    it("should format 11-digit mobile number starting with 010", () => {
      expect(formatPhoneNumber("01012345678")).toBe("010-1234-5678");
    });

    it("should format 010 number with existing dashes", () => {
      expect(formatPhoneNumber("010-1234-5678")).toBe("010-1234-5678");
    });

    it("should format 10-digit Seoul landline (02)", () => {
      expect(formatPhoneNumber("0212345678")).toBe("02-1234-5678");
    });

    it("should format 9-digit Seoul landline (02)", () => {
      expect(formatPhoneNumber("021234567")).toBe("02-123-4567");
    });

    it("should format 11-digit number not starting with 010", () => {
      expect(formatPhoneNumber("03112345678")).toBe("031-1234-5678");
    });

    it("should format 10-digit non-Seoul number", () => {
      expect(formatPhoneNumber("0311234567")).toBe("031-123-4567");
    });

    it("should return original for unrecognized format", () => {
      expect(formatPhoneNumber("12345")).toBe("12345");
    });

    it("should return original for very short numbers", () => {
      expect(formatPhoneNumber("123")).toBe("123");
    });

    it("should strip non-digit characters before formatting", () => {
      expect(formatPhoneNumber("010 1234 5678")).toBe("010-1234-5678");
    });
  });

  describe("non-Korean locale", () => {
    it("should return original phone string for non-ko locale", () => {
      expect(formatPhoneNumber("01012345678", "en")).toBe("01012345678");
    });

    it("should return original with dashes for non-ko locale", () => {
      expect(formatPhoneNumber("010-1234-5678", "en")).toBe("010-1234-5678");
    });
  });
});
