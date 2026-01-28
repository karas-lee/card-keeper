import { QueryClient } from "@tanstack/react-query";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Returns a singleton QueryClient.
 *
 * On the server a new client is created for every call so that
 * different requests never share state. In the browser the same
 * instance is reused across the lifetime of the tab.
 */
export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: always create a new client
    return makeQueryClient();
  }

  // Browser: reuse singleton
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
