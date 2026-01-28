import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const publicPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/onboarding",
];

const authPaths = ["/login", "/register"];

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-do-not-use-in-production";

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET);
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecretKey());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isPublicPath = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isAuthPath = authPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // Try to get the token from cookie or authorization header
  const tokenFromCookie = request.cookies.get("access_token")?.value;
  const authHeader = request.headers.get("authorization");
  const tokenFromHeader = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;
  const token = tokenFromCookie || tokenFromHeader;

  const isAuthenticated = token ? await verifyToken(token) : false;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthPath) {
    return NextResponse.redirect(new URL("/cards", request.url));
  }

  // Redirect unauthenticated users to login for protected pages
  if (!isAuthenticated && !isPublicPath && pathname !== "/") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
