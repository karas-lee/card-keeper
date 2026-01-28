import { SignJWT, jwtVerify } from "jose";
import { LIMITS } from "@cardkeeper/shared-constants";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-do-not-use-in-production";

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET);
}

export async function generateAccessToken(
  userId: string,
  email: string
): Promise<string> {
  const token = await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${LIMITS.ACCESS_TOKEN_EXPIRY_MINUTES}m`)
    .sign(getSecretKey());

  return token;
}

export async function generateRefreshToken(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());

  return token;
}

export async function verifyAccessToken(
  token: string
): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const { userId, email } = payload as { userId: string; email: string };

    if (!userId || !email) {
      return null;
    }

    return { userId, email };
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const { userId } = payload as { userId: string };

    if (!userId) {
      return null;
    }

    return { userId };
  } catch {
    return null;
  }
}
