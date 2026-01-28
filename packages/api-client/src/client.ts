import type { ApiError } from "@cardkeeper/shared-types";

import { ApiClientError } from "./errors";

export interface HttpClientConfig {
  baseUrl: string;
  getToken: () => string | null;
  onUnauthorized: () => void;
}

export class HttpClient {
  private baseUrl: string;
  private getToken: () => string | null;
  private onUnauthorized: () => void;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl;
    this.getToken = config.getToken;
    this.onUnauthorized = config.onUnauthorized;
  }

  private async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      params?: Record<string, string | number | boolean | undefined>;
      headers?: Record<string, string>;
      isFormData?: boolean;
    }
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (options?.params) {
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!options?.isFormData ? { "Content-Type": "application/json" } : {}),
      ...options?.headers,
    };

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: options?.isFormData
        ? (options.body as FormData)
        : options?.body
          ? JSON.stringify(options.body)
          : undefined,
    });

    if (response.status === 401) {
      this.onUnauthorized();
      throw new ApiClientError("UNAUTHORIZED", "인증이 필요합니다", 401);
    }

    if (!response.ok) {
      const error = (await response.json()) as ApiError;
      throw new ApiClientError(
        error.error.code,
        error.error.message,
        response.status,
        error.error.details
      );
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("text/") || contentType?.includes("application/octet-stream")) {
      return response.blob() as unknown as T;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  get<T>(path: string, params?: Record<string, string | number | boolean | undefined>) {
    return this.request<T>("GET", path, { params });
  }

  post<T>(path: string, body?: unknown, options?: { isFormData?: boolean }) {
    return this.request<T>("POST", path, { body, ...options });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>("PUT", path, { body });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>("PATCH", path, { body });
  }

  delete<T>(path: string) {
    return this.request<T>("DELETE", path);
  }
}
