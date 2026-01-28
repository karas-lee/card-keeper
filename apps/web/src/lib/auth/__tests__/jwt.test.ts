import { describe, it, expect } from "vitest";
import {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../jwt";

describe("JWT utilities", () => {
  const testUserId = "user-123";
  const testEmail = "test@example.com";

  describe("generateAccessToken", () => {
    it("should generate a non-empty string token", async () => {
      const token = await generateAccessToken(testUserId, testEmail);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("should generate different tokens on each call (due to iat)", async () => {
      const token1 = await generateAccessToken(testUserId, testEmail);
      // iat is in seconds, so wait >1s to guarantee different tokens
      await new Promise((r) => setTimeout(r, 1100));
      const token2 = await generateAccessToken(testUserId, testEmail);

      expect(token1).not.toBe(token2);
    });
  });

  describe("verifyAccessToken", () => {
    it("should verify a valid access token and return userId and email", async () => {
      const token = await generateAccessToken(testUserId, testEmail);
      const payload = await verifyAccessToken(token);

      expect(payload).not.toBeNull();
      expect(payload!.userId).toBe(testUserId);
      expect(payload!.email).toBe(testEmail);
    });

    it("should return null for an invalid token", async () => {
      const result = await verifyAccessToken("invalid.token.value");

      expect(result).toBeNull();
    });

    it("should return null for an empty string", async () => {
      const result = await verifyAccessToken("");

      expect(result).toBeNull();
    });

    it("should return null for a tampered token", async () => {
      const token = await generateAccessToken(testUserId, testEmail);
      const tampered = token.slice(0, -5) + "XXXXX";
      const result = await verifyAccessToken(tampered);

      expect(result).toBeNull();
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a non-empty string token", async () => {
      const token = await generateRefreshToken(testUserId);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe("verifyRefreshToken", () => {
    it("should verify a valid refresh token and return userId", async () => {
      const token = await generateRefreshToken(testUserId);
      const payload = await verifyRefreshToken(token);

      expect(payload).not.toBeNull();
      expect(payload!.userId).toBe(testUserId);
    });

    it("should return null for an invalid token", async () => {
      const result = await verifyRefreshToken("not-a-real-jwt");

      expect(result).toBeNull();
    });

    it("should return null for a tampered token", async () => {
      const token = await generateRefreshToken(testUserId);
      const tampered = token.slice(0, -5) + "ZZZZZ";
      const result = await verifyRefreshToken(tampered);

      expect(result).toBeNull();
    });
  });

  describe("cross-token verification", () => {
    it("access token verified as refresh token should still return userId", async () => {
      // Access tokens contain userId too, so verifyRefreshToken should work
      const token = await generateAccessToken(testUserId, testEmail);
      const result = await verifyRefreshToken(token);

      expect(result).not.toBeNull();
      expect(result!.userId).toBe(testUserId);
    });
  });
});
