import { QueryClient } from "@tanstack/react-query";
import { MMKV } from "react-native-mmkv";

const queryStorage = new MMKV({ id: "cardkeeper-query-cache" });

/**
 * MMKV-based persister for React Query.
 * Stores serialized query cache in MMKV for offline support.
 */
export const mmkvPersister = {
  persistClient: (client: unknown) => {
    try {
      queryStorage.set("query-cache", JSON.stringify(client));
    } catch {
      // Silently fail on serialization errors
    }
  },
  restoreClient: (): unknown => {
    try {
      const cached = queryStorage.getString("query-cache");
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Clear corrupted cache
      queryStorage.delete("query-cache");
    }
    return undefined;
  },
  removeClient: () => {
    queryStorage.delete("query-cache");
  },
};

/**
 * Default query client options optimized for mobile.
 *
 * - `staleTime`: 5 minutes -- avoids unnecessary refetches on tab switches.
 * - `gcTime`: 30 minutes -- keeps unused data around for quick back-navigation.
 * - `retry`: 2 for queries, 1 for mutations -- conservative retries for mobile networks.
 * - `refetchOnWindowFocus`: disabled -- mobile apps foreground frequently.
 */
export const defaultQueryClientOptions = {
  queries: {
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: 1,
  },
} as const;

/**
 * Creates a new QueryClient instance configured for mobile usage.
 * Call this inside a `useState` initializer to ensure one client per component tree.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: defaultQueryClientOptions,
  });
}
