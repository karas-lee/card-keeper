import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "@/lib/services/auth.service";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/api-response";
import { ERROR_CODES, LIMITS } from "@cardkeeper/shared-constants";

vi.mock("@/lib/auth/password", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed-password"),
  verifyPassword: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/auth/jwt", () => ({
  generateAccessToken: vi.fn().mockResolvedValue("access-token"),
  generateRefreshToken: vi.fn().mockResolvedValue("refresh-token"),
  verifyRefreshToken: vi.fn().mockResolvedValue({ userId: "user-1" }),
}));

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  avatarUrl: null,
  authProvider: "EMAIL",
  emailVerified: null,
  passwordHash: "hashed-password",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should create user with default folder and return tokens", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const txUserCreate = vi.fn().mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        avatarUrl: mockUser.avatarUrl,
        authProvider: mockUser.authProvider,
        emailVerified: mockUser.emailVerified,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      const txFolderCreate = vi.fn().mockResolvedValue({});

      (prisma.$transaction as any).mockImplementation(async (fn: any) => {
        if (typeof fn === "function") {
          return fn({
            user: { create: txUserCreate },
            folder: { create: txFolderCreate },
          });
        }
        return Promise.resolve();
      });

      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);

      const result = await AuthService.register({
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
        name: "Test User",
      });

      expect(result.user.email).toBe("test@example.com");
      expect(result.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");
      expect(txUserCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: "test@example.com",
            name: "Test User",
            passwordHash: "hashed-password",
            authProvider: "EMAIL",
          }),
        }),
      );
      expect(txFolderCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: "미분류",
            isDefault: true,
          }),
        }),
      );
      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });

    it("should throw 409 when email already exists", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      try {
        await AuthService.register({
          email: "test@example.com",
          password: "password123",
          confirmPassword: "password123",
          name: "Test User",
        });
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ERROR_CODES.EMAIL_ALREADY_EXISTS);
        expect((error as AppError).statusCode).toBe(409);
      }
    });
  });

  describe("login", () => {
    it("should verify password and return tokens on success", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.loginAttempt.count).mockResolvedValue(0);
      vi.mocked(prisma.loginAttempt.create).mockResolvedValue({} as any);
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);

      const { verifyPassword } = await import("@/lib/auth/password");
      vi.mocked(verifyPassword).mockResolvedValue(true);

      const result = await AuthService.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.user.email).toBe("test@example.com");
      expect(result.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");
      expect(prisma.loginAttempt.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ success: true }),
        }),
      );
    });

    it("should throw 401 when password is wrong", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.loginAttempt.count).mockResolvedValue(0);
      vi.mocked(prisma.loginAttempt.create).mockResolvedValue({} as any);

      const { verifyPassword } = await import("@/lib/auth/password");
      vi.mocked(verifyPassword).mockResolvedValue(false);

      try {
        await AuthService.login({
          email: "test@example.com",
          password: "wrong-password",
        });
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ERROR_CODES.INVALID_CREDENTIALS);
        expect((error as AppError).statusCode).toBe(401);
      }
    });

    it("should throw 423 when account is locked after too many failures", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.loginAttempt.count).mockResolvedValue(
        LIMITS.MAX_LOGIN_ATTEMPTS,
      );

      try {
        await AuthService.login({
          email: "test@example.com",
          password: "password123",
        });
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ERROR_CODES.ACCOUNT_LOCKED);
        expect((error as AppError).statusCode).toBe(423);
      }
    });
  });

  describe("logout", () => {
    it("should revoke the refresh token", async () => {
      vi.mocked(prisma.refreshToken.updateMany).mockResolvedValue({
        count: 1,
      });

      await AuthService.logout("some-refresh-token");

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { token: "some-refresh-token", revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe("refreshTokens", () => {
    it("should revoke old token and create new tokens", async () => {
      const storedToken = {
        id: "token-1",
        token: "old-refresh-token",
        userId: "user-1",
        revokedAt: null,
        expiresAt: new Date(Date.now() + 86400000), // future
        createdAt: new Date(),
      };

      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(
        storedToken as any,
      );
      vi.mocked(prisma.refreshToken.update).mockResolvedValue({} as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as any);

      const result = await AuthService.refreshTokens("old-refresh-token");

      expect(result.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");
      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: "token-1" },
        data: { revokedAt: expect.any(Date) },
      });
      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });

    it("should throw 401 when token payload is invalid", async () => {
      const { verifyRefreshToken } = await import("@/lib/auth/jwt");
      vi.mocked(verifyRefreshToken).mockResolvedValue(null as any);

      try {
        await AuthService.refreshTokens("invalid-token");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ERROR_CODES.INVALID_TOKEN);
        expect((error as AppError).statusCode).toBe(401);
      }
    });
  });

  describe("getMe", () => {
    it("should return the user", async () => {
      const safeUser = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        avatarUrl: mockUser.avatarUrl,
        authProvider: mockUser.authProvider,
        emailVerified: mockUser.emailVerified,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(safeUser as any);

      const result = await AuthService.getMe("user-1");

      expect(result.id).toBe("user-1");
      expect(result.email).toBe("test@example.com");
    });

    it("should throw 404 when user is not found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      try {
        await AuthService.getMe("nonexistent-id");
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ERROR_CODES.NOT_FOUND);
        expect((error as AppError).statusCode).toBe(404);
      }
    });
  });
});
