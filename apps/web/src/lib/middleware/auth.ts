import { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { AppError } from "@/lib/utils/api-response";
import { ERROR_CODES } from "@cardkeeper/shared-constants";
import { prisma } from "@/lib/db";
import {
  verifyFirebaseToken,
  isFirebaseConfigured,
} from "@/lib/auth/firebase-admin";

export interface AuthContext {
  userId: string;
  email: string;
  name: string | null;
  source: "authjs" | "firebase";
}

export async function authenticate(req: NextRequest): Promise<AuthContext> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "인증이 필요합니다", 401);
  }

  const token = authHeader.slice(7);

  // 1. Try JWT verification (self-issued tokens)
  const jwtPayload = await verifyAccessToken(token);
  if (jwtPayload) {
    const user = await prisma.user.findUnique({
      where: { id: jwtPayload.userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      throw new AppError(
        ERROR_CODES.UNAUTHORIZED,
        "사용자를 찾을 수 없습니다",
        401
      );
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      source: "authjs",
    };
  }

  // 2. Try Firebase ID token verification
  if (isFirebaseConfigured()) {
    const firebaseUser = await verifyFirebaseToken(token);
    if (firebaseUser) {
      // Find or create user by Firebase UID / email
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { firebaseUid: firebaseUser.uid },
            { email: firebaseUser.email },
          ],
        },
        select: { id: true, email: true, name: true, firebaseUid: true },
      });

      if (user && !user.firebaseUid) {
        // Link existing email user with Firebase UID
        await prisma.user.update({
          where: { id: user.id },
          data: { firebaseUid: firebaseUser.uid },
        });
      }

      if (!user) {
        // Auto-create user from Firebase token
        user = await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email: firebaseUser.email,
              name: firebaseUser.name,
              firebaseUid: firebaseUser.uid,
              authProvider: "FIREBASE",
            },
            select: { id: true, email: true, name: true, firebaseUid: true },
          });

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
      }

      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        source: "firebase",
      };
    }
  }

  throw new AppError(
    ERROR_CODES.INVALID_TOKEN,
    "유효하지 않은 토큰입니다",
    401
  );
}
