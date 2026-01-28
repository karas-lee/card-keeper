import { vi } from "vitest";

// Mock Prisma client
vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    businessCard: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
    folder: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    tag: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    refreshToken: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    loginAttempt: { count: vi.fn(), create: vi.fn() },
    passwordResetToken: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    verificationToken: { findUnique: vi.fn(), delete: vi.fn() },
    cardTag: { create: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
    $transaction: vi.fn((fn) => (typeof fn === "function" ? fn({
      user: { create: vi.fn(), update: vi.fn() },
      folder: { create: vi.fn() },
      businessCard: { create: vi.fn() },
      passwordResetToken: { update: vi.fn() },
      refreshToken: { updateMany: vi.fn() },
      verificationToken: { delete: vi.fn() },
    }) : Promise.resolve())),
  },
}));

// Set test environment variables
process.env.JWT_SECRET = "test-secret-key-for-vitest";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
