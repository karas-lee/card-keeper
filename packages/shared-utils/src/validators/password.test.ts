import { describe, it, expect } from "vitest";
import {
  validatePasswordRules,
  getPasswordStrength,
} from "../validators/password";

describe("validatePasswordRules", () => {
  it("should return all true for a strong password", () => {
    const result = validatePasswordRules("Password1!");
    expect(result).toEqual({
      hasMinLength: true,
      hasLetter: true,
      hasNumber: true,
      hasSpecialChar: true,
    });
  });

  it("should return hasMinLength false for short password", () => {
    const result = validatePasswordRules("Pa1!");
    expect(result.hasMinLength).toBe(false);
    expect(result.hasLetter).toBe(true);
    expect(result.hasNumber).toBe(true);
    expect(result.hasSpecialChar).toBe(true);
  });

  it("should return hasLetter false for password without letters", () => {
    const result = validatePasswordRules("12345678!");
    expect(result.hasMinLength).toBe(true);
    expect(result.hasLetter).toBe(false);
    expect(result.hasNumber).toBe(true);
    expect(result.hasSpecialChar).toBe(true);
  });

  it("should return hasNumber false for password without numbers", () => {
    const result = validatePasswordRules("Password!");
    expect(result.hasMinLength).toBe(true);
    expect(result.hasLetter).toBe(true);
    expect(result.hasNumber).toBe(false);
    expect(result.hasSpecialChar).toBe(true);
  });

  it("should return hasSpecialChar false for password without special chars", () => {
    const result = validatePasswordRules("Password1");
    expect(result.hasMinLength).toBe(true);
    expect(result.hasLetter).toBe(true);
    expect(result.hasNumber).toBe(true);
    expect(result.hasSpecialChar).toBe(false);
  });

  it("should return all false for empty string", () => {
    const result = validatePasswordRules("");
    expect(result).toEqual({
      hasMinLength: false,
      hasLetter: false,
      hasNumber: false,
      hasSpecialChar: false,
    });
  });
});

describe("getPasswordStrength", () => {
  it("should return 'strong' when all 4 rules pass", () => {
    expect(getPasswordStrength("Password1!")).toBe("strong");
  });

  it("should return 'medium' when 3 rules pass", () => {
    // Missing special char
    expect(getPasswordStrength("Password1")).toBe("medium");
  });

  it("should return 'weak' when 2 rules pass", () => {
    // Has length and letters only
    expect(getPasswordStrength("abcdefgh")).toBe("weak");
  });

  it("should return 'weak' when 1 rule passes", () => {
    // Has only numbers, no length
    expect(getPasswordStrength("123")).toBe("weak");
  });

  it("should return 'weak' when 0 rules pass", () => {
    expect(getPasswordStrength("")).toBe("weak");
  });

  it("should return 'medium' for password with letters, numbers, and length but no special", () => {
    expect(getPasswordStrength("Abcdefg1")).toBe("medium");
  });

  it("should return 'strong' for password meeting all criteria", () => {
    expect(getPasswordStrength("MyP@ssw0rd")).toBe("strong");
  });
});
