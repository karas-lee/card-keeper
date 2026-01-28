import { useAuthStore } from "../stores/auth.store";

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export async function apiFetch(path: string, options?: RequestInit) {
  const token = useAuthStore.getState().accessToken;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    useAuthStore.getState().logout();
    throw new Error("인증이 만료되었습니다");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "요청에 실패했습니다");
  }

  if (res.status === 204) return null;
  return res.json();
}

export async function apiUpload(path: string, formData: FormData) {
  const token = useAuthStore.getState().accessToken;
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    useAuthStore.getState().logout();
    throw new Error("인증이 만료되었습니다");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "업로드에 실패했습니다");
  }

  return res.json();
}
