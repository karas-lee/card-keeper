import { useEffect, useState } from "react";
import { useSegments, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuthStore } from "@/stores/auth.store";

/**
 * AuthProvider handles:
 * 1. Hydrating persisted auth state from MMKV on mount.
 * 2. Redirecting the user to the correct route group whenever auth state changes.
 *
 * Route groups follow Expo Router conventions:
 *   - `(auth)` -- unauthenticated screens (login, register)
 *   - `(tabs)` -- authenticated screens
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrate } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore persisted auth state on mount
  useEffect(() => {
    hydrate();
    setIsHydrated(true);
  }, [hydrate]);

  // Redirect based on auth state whenever it changes or segments change
  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // User is not signed in and not already viewing auth screens
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // User is signed in but still on an auth screen
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, isHydrated, router]);

  // Show a loading indicator while hydrating persisted state
  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return <>{children}</>;
}
