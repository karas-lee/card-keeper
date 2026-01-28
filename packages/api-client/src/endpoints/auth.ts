import type {
  ApiResponse,
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
  ResetPasswordRequest,
  TokenResponse,
  User,
} from "@cardkeeper/shared-types";

import type { HttpClient } from "../client";

export function createAuthEndpoints(client: HttpClient) {
  return {
    register: (data: RegisterRequest) =>
      client.post<ApiResponse<AuthResponse>>("/auth/register", data).then((r) => r.data),

    login: (data: LoginRequest) =>
      client.post<ApiResponse<AuthResponse>>("/auth/login", data).then((r) => r.data),

    logout: () => client.post<void>("/auth/logout"),

    refresh: (data: RefreshRequest) =>
      client.post<ApiResponse<TokenResponse>>("/auth/refresh", data).then((r) => r.data),

    forgotPassword: (data: ForgotPasswordRequest) =>
      client.post<void>("/auth/forgot-password", data),

    resetPassword: (data: ResetPasswordRequest) =>
      client.post<void>("/auth/reset-password", data),

    verifyEmail: (token: string) => client.post<void>("/auth/verify-email", { token }),

    getMe: () => client.get<ApiResponse<User>>("/auth/me").then((r) => r.data),
  };
}
