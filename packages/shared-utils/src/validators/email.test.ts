import { describe, it, expect } from "vitest";
import { isValidEmail } from "../validators/email";

describe("isValidEmail", () => {
  it("should return true for a standard email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("should return true for email with + sign", () => {
    expect(isValidEmail("user+tag@example.com")).toBe(true);
  });

  it("should return true for email with dots in local part", () => {
    expect(isValidEmail("first.last@example.com")).toBe(true);
  });

  it("should return true for email with subdomain", () => {
    expect(isValidEmail("user@mail.example.com")).toBe(true);
  });

  it("should return false for email missing @", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
  });

  it("should return false for email without domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  it("should return false for email without TLD", () => {
    expect(isValidEmail("user@example")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });

  it("should return false for random text", () => {
    expect(isValidEmail("not an email")).toBe(false);
  });

  it("should trim whitespace before validating", () => {
    expect(isValidEmail("  user@example.com  ")).toBe(true);
  });

  it("should return true for email with numbers", () => {
    expect(isValidEmail("user123@example456.com")).toBe(true);
  });

  it("should return true for email with hyphens in domain", () => {
    expect(isValidEmail("user@my-domain.com")).toBe(true);
  });
});
