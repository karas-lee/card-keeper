import { createApiClient, queryKeys, ApiClientError } from "@cardkeeper/api-client";
import type { ApiClient } from "@cardkeeper/api-client";
import { useAuthStore } from "../stores/auth.store";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api/v1";

function getToken(): string | null {
  return useAuthStore.getState().accessToken;
}

function handleUnauthorized(): void {
  useAuthStore.getState().logout();
}

export const apiClient: ApiClient = createApiClient({
  baseUrl: API_BASE_URL,
  getToken,
  onUnauthorized: handleUnauthorized,
});

// Re-export individual service modules for convenient access
export const authApi = apiClient.auth;
export const cardsApi = apiClient.cards;
export const foldersApi = apiClient.folders;
export const tagsApi = apiClient.tags;
export const scanApi = apiClient.scan;
export const exportApi = apiClient.export;

// Re-export query keys and error class for use in hooks
export { queryKeys, ApiClientError };
