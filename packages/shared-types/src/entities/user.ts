import type { AuthProvider } from "../enums";

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  authProvider: AuthProvider;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
