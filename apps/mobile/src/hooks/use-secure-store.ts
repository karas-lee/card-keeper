import { useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";

export interface UseSecureStoreReturn {
  /** The current value stored under the key, or null if not set / still loading */
  value: string | null;
  /** Whether the initial value is still being loaded */
  isLoading: boolean;
  /** Retrieve the value for the key from secure storage */
  getItem: () => Promise<string | null>;
  /** Store a value under the key in secure storage */
  setItem: (newValue: string) => Promise<void>;
  /** Delete the value for the key from secure storage */
  deleteItem: () => Promise<void>;
}

/**
 * Hook for reading and writing values in expo-secure-store.
 *
 * Provides a reactive `value` that is loaded on mount, plus `getItem`,
 * `setItem`, and `deleteItem` async methods that keep the local state
 * synchronised with the underlying secure storage.
 *
 * All operations are wrapped in try/catch so that secure store errors
 * (e.g., on unsupported platforms) are handled gracefully and logged
 * to the console rather than crashing the app.
 *
 * @param key - The storage key to operate on.
 *
 * @example
 * ```tsx
 * const { value, isLoading, setItem, deleteItem } = useSecureStore("auth.accessToken");
 *
 * // Save a token
 * await setItem(token);
 *
 * // Clear a token on logout
 * await deleteItem();
 * ```
 */
export function useSecureStore(key: string): UseSecureStoreReturn {
  const [value, setValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load the initial value on mount (or when the key changes)
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const storedValue = await SecureStore.getItemAsync(key);
        if (!cancelled) {
          setValue(storedValue);
        }
      } catch (error) {
        console.warn(`[useSecureStore] Failed to get item for key "${key}":`, error);
        if (!cancelled) {
          setValue(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [key]);

  const getItem = useCallback(async (): Promise<string | null> => {
    try {
      const storedValue = await SecureStore.getItemAsync(key);
      setValue(storedValue);
      return storedValue;
    } catch (error) {
      console.warn(`[useSecureStore] Failed to get item for key "${key}":`, error);
      return null;
    }
  }, [key]);

  const setItem = useCallback(
    async (newValue: string): Promise<void> => {
      try {
        await SecureStore.setItemAsync(key, newValue);
        setValue(newValue);
      } catch (error) {
        console.warn(`[useSecureStore] Failed to set item for key "${key}":`, error);
      }
    },
    [key],
  );

  const deleteItem = useCallback(async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
      setValue(null);
    } catch (error) {
      console.warn(`[useSecureStore] Failed to delete item for key "${key}":`, error);
    }
  }, [key]);

  return {
    value,
    isLoading,
    getItem,
    setItem,
    deleteItem,
  };
}
