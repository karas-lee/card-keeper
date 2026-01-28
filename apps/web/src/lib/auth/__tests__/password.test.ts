import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../password";

describe("Password utilities", () => {
  const testPassword = "SecureP@ssw0rd!";

  describe("hashPassword", () => {
    it("should return a hashed string different from the original password", async () => {
      const hash = await hashPassword(testPassword);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash).not.toBe(testPassword);
    });

    it("should produce a bcrypt hash (starts with $2b$)", async () => {
      const hash = await hashPassword(testPassword);

      expect(hash).toMatch(/^\$2[aby]\$/);
    });

    it("should generate different hashes for the same password (salt)", async () => {
      const hash1 = await hashPassword(testPassword);
      const hash2 = await hashPassword(testPassword);

      expect(hash1).not.toBe(hash2);
    });

    it("should generate different hashes for different passwords", async () => {
      const hash1 = await hashPassword("password1");
      const hash2 = await hashPassword("password2");

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("should return true for correct password", async () => {
      const hash = await hashPassword(testPassword);
      const result = await verifyPassword(testPassword, hash);

      expect(result).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const hash = await hashPassword(testPassword);
      const result = await verifyPassword("WrongPassword123!", hash);

      expect(result).toBe(false);
    });

    it("should return false for empty password against a valid hash", async () => {
      const hash = await hashPassword(testPassword);
      const result = await verifyPassword("", hash);

      expect(result).toBe(false);
    });

    it("should verify correctly even with similar passwords", async () => {
      const hash = await hashPassword("MyPassword1");
      const result = await verifyPassword("MyPassword2", hash);

      expect(result).toBe(false);
    });

    it("should handle unicode passwords", async () => {
      const unicodePassword = "비밀번호ABC123!";
      const hash = await hashPassword(unicodePassword);
      const result = await verifyPassword(unicodePassword, hash);

      expect(result).toBe(true);
    });
  });
});
