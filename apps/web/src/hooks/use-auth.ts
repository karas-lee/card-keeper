"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";

const API_BASE = "/api/v1";

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "로그인에 실패했습니다");
      }
      return res.json();
    },
    onSuccess: (result) => {
      const { user, accessToken, refreshToken } = result.data;
      setAuth(user, accessToken, refreshToken);
      toast.success("로그인되었습니다");
      router.push("/cards");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
    }) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "회원가입에 실패했습니다");
      }
      return res.json();
    },
    onSuccess: (result) => {
      const { user, accessToken, refreshToken } = result.data;
      setAuth(user, accessToken, refreshToken);
      toast.success("회원가입이 완료되었습니다");
      router.push("/cards");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const { accessToken, refreshToken, logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ refreshToken }),
      });
    },
    onSettled: () => {
      logout();
      router.push("/login");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "요청에 실패했습니다");
      }
    },
    onSuccess: () => {
      toast.success("비밀번호 재설정 이메일을 전송했습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          err.error?.message || "비밀번호 재설정에 실패했습니다"
        );
      }
    },
    onSuccess: () => {
      toast.success("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
      router.push("/login");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useCurrentUser() {
  const { accessToken, isAuthenticated, logout } = useAuthStore();

  return useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        if (res.status === 401) logout();
        throw new Error("사용자 정보를 가져올 수 없습니다");
      }
      const result = await res.json();
      return result.data;
    },
    enabled: isAuthenticated && !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
}
