import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";

/**
 * AppProviders composes every top-level provider required by the app.
 *
 * Order (outermost to innermost):
 *   1. GestureHandlerRootView -- must wrap the entire tree for gestures to work
 *   2. SafeAreaProvider -- provides safe-area insets to all descendants
 *   3. QueryProvider -- React Query client for data fetching / caching
 *   4. AuthProvider -- hydrates auth state and guards route access
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
