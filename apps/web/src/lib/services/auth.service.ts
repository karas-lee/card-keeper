import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateAccessToken, generateRefreshToken } from "@/lib/auth/jwt";
import { AppError } from "@/lib/utils/api-response";
import { ERROR_CODES, LIMITS } from "@cardkeeper/shared-constants";
import type { RegisterInput, LoginInput } from "@cardkeeper/shared-utils";

export class AuthService {
  // Register new user
  static async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) {
      throw new AppError(
        ERROR_CODES.EMAIL_ALREADY_EXISTS,
        "이미 사용 중인 이메일입니다",
        409
      );
    }

    const passwordHash = await hashPassword(input.password);

    // Create user and default folder in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: input.email,
          name: input.name,
          passwordHash,
          authProvider: "EMAIL",
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          authProvider: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Create default "미분류" folder
      await tx.folder.create({
        data: {
          userId: newUser.id,
          name: "미분류",
          color: "#9CA3AF",
          order: 999,
          isDefault: true,
        },
      });

      return newUser;
    });

    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken(user.id, user.email),
      generateRefreshToken(user.id),
    ]);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(
          Date.now() + LIMITS.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        ),
      },
    });

    return { user, accessToken, refreshToken };
  }

  // Login with email/password
  static async login(input: LoginInput, ipAddress?: string) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    // Check for account lockout
    if (user) {
      const recentFailures = await prisma.loginAttempt.count({
        where: {
          email: input.email,
          success: false,
          createdAt: {
            gt: new Date(
              Date.now() - LIMITS.LOGIN_LOCKOUT_MINUTES * 60 * 1000
            ),
          },
        },
      });
      if (recentFailures >= LIMITS.MAX_LOGIN_ATTEMPTS) {
        throw new AppError(
          ERROR_CODES.ACCOUNT_LOCKED,
          `계정이 잠겼습니다. ${LIMITS.LOGIN_LOCKOUT_MINUTES}분 후 다시 시도해주세요.`,
          423
        );
      }
    }

    if (!user || !user.passwordHash) {
      // Record failed attempt
      await prisma.loginAttempt.create({
        data: {
          email: input.email,
          ipAddress,
          success: false,
          userId: user?.id,
        },
      });
      throw new AppError(
        ERROR_CODES.INVALID_CREDENTIALS,
        "이메일 또는 비밀번호가 올바르지 않습니다",
        401
      );
    }

    const isValid = await verifyPassword(input.password, user.passwordHash);
    if (!isValid) {
      await prisma.loginAttempt.create({
        data: {
          email: input.email,
          ipAddress,
          success: false,
          userId: user.id,
        },
      });
      throw new AppError(
        ERROR_CODES.INVALID_CREDENTIALS,
        "이메일 또는 비밀번호가 올바르지 않습니다",
        401
      );
    }

    // Record successful login
    await prisma.loginAttempt.create({
      data: {
        email: input.email,
        ipAddress,
        success: true,
        userId: user.id,
      },
    });

    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken(user.id, user.email),
      generateRefreshToken(user.id),
    ]);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(
          Date.now() + LIMITS.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        ),
      },
    });

    const { passwordHash: _, ...safeUser } = user as any;
    return {
      user: {
        id: safeUser.id,
        email: safeUser.email,
        name: safeUser.name,
        avatarUrl: safeUser.avatarUrl,
        authProvider: safeUser.authProvider,
        emailVerified: safeUser.emailVerified,
        createdAt: safeUser.createdAt,
        updatedAt: safeUser.updatedAt,
      },
      accessToken,
      refreshToken,
    };
  }

  // Logout (revoke refresh token)
  static async logout(refreshToken: string) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // Refresh tokens
  static async refreshTokens(refreshTokenStr: string) {
    const { verifyRefreshToken } = await import("@/lib/auth/jwt");

    const payload = await verifyRefreshToken(refreshTokenStr);
    if (!payload) {
      throw new AppError(
        ERROR_CODES.INVALID_TOKEN,
        "유효하지 않은 리프레시 토큰입니다",
        401
      );
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenStr },
    });

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt < new Date()
    ) {
      throw new AppError(
        ERROR_CODES.TOKEN_EXPIRED,
        "만료된 리프레시 토큰입니다",
        401
      );
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      throw new AppError(
        ERROR_CODES.UNAUTHORIZED,
        "사용자를 찾을 수 없습니다",
        401
      );
    }

    const [newAccessToken, newRefreshToken] = await Promise.all([
      generateAccessToken(user.id, user.email),
      generateRefreshToken(user.id),
    ]);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: new Date(
          Date.now() + LIMITS.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        ),
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  // Get current user
  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        authProvider: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new AppError(
        ERROR_CODES.NOT_FOUND,
        "사용자를 찾을 수 없습니다",
        404
      );
    }
    return user;
  }

  // Forgot password - create reset token
  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // Don't reveal user existence

    const token = crypto.randomUUID();
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt: new Date(
          Date.now() + LIMITS.PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1000
        ),
      },
    });
    // In production, send email here
    console.log(`[DEV] Password reset token for ${email}: ${token}`);
  }

  // Reset password
  static async resetPassword(token: string, newPassword: string) {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });
    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt < new Date()
    ) {
      throw new AppError(
        ERROR_CODES.INVALID_TOKEN,
        "유효하지 않거나 만료된 토큰입니다",
        400
      );
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetToken.email },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      // Revoke all refresh tokens for security
      prisma.refreshToken.updateMany({
        where: { user: { email: resetToken.email }, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  // Verify email
  static async verifyEmail(token: string) {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });
    if (!verificationToken || verificationToken.expires < new Date()) {
      throw new AppError(
        ERROR_CODES.INVALID_TOKEN,
        "유효하지 않거나 만료된 토큰입니다",
        400
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { email: verificationToken.identifier },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationToken.identifier,
            token,
          },
        },
      }),
    ]);
  }
}
