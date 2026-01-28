import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { authConfig } from "./auth.config";

const nextAuth = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
});

export const handlers = nextAuth.handlers;
export const auth = nextAuth.auth;
export const signIn: any = nextAuth.signIn;
export const signOut = nextAuth.signOut;
