import type { NextAuthConfig } from "next-auth";
import { credentialsProvider } from "./providers/credentials";
import { googleProvider } from "./providers/google";
import { appleProvider } from "./providers/apple";
import { kakaoProvider } from "./providers/kakao";
import { jwtCallback } from "./callbacks/jwt";
import { sessionCallback } from "./callbacks/session";

export const authConfig: NextAuthConfig = {
  providers: [
    credentialsProvider,
    googleProvider,
    appleProvider,
    kakaoProvider,
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
    error: "/login",
  },
  callbacks: {
    jwt: jwtCallback,
    session: sessionCallback,
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-create default folder for OAuth users
      if (user.id) {
        const { prisma } = await import("@/lib/db");
        const existingDefault = await prisma.folder.findFirst({
          where: { userId: user.id, isDefault: true },
        });
        if (!existingDefault) {
          await prisma.folder.create({
            data: {
              userId: user.id,
              name: "미분류",
              color: "#9CA3AF",
              order: 999,
              isDefault: true,
            },
          });
        }
      }
    },
  },
};
