import { create } from "zustand";
import { MMKV } from "react-native-mmkv";

const storage = new MMKV({ id: "cardkeeper-auth" });

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api/v1";

interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  hydrate: () => void;
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: (user, accessToken, refreshToken) => {
    storage.set("user", JSON.stringify(user));
    storage.set("accessToken", accessToken);
    storage.set("refreshToken", refreshToken);
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },
  logout: () => {
    storage.delete("user");
    storage.delete("accessToken");
    storage.delete("refreshToken");
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
  hydrate: () => {
    const userStr = storage.getString("user");
    const accessToken = storage.getString("accessToken");
    const refreshToken = storage.getString("refreshToken");
    if (userStr && accessToken) {
      set({
        user: JSON.parse(userStr),
        accessToken,
        refreshToken: refreshToken || null,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },
  refreshAccessToken: async () => {
    const { refreshToken } = get();
    if (!refreshToken) {
      get().logout();
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) throw new Error("Token refresh failed");
      const data = await res.json();
      const newAccessToken = data.data.accessToken;
      const newRefreshToken = data.data.refreshToken;
      storage.set("accessToken", newAccessToken);
      storage.set("refreshToken", newRefreshToken);
      set({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch {
      get().logout();
    }
  },
}));
