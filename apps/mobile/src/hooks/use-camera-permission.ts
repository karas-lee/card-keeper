import { useCallback } from "react";
import { useCameraPermissions } from "expo-camera";

export interface UseCameraPermissionReturn {
  /** Whether camera permission has been granted */
  hasPermission: boolean;
  /** Whether the permission status is still being determined */
  isLoading: boolean;
  /** Whether permission was explicitly denied by the user */
  isDenied: boolean;
  /** Request camera permission from the user. Returns true if granted. */
  requestPermission: () => Promise<boolean>;
}

/**
 * Hook to manage camera permission state using expo-camera.
 *
 * Wraps the expo-camera `useCameraPermissions` API and provides a simplified
 * interface for checking, requesting, and reacting to camera permission status.
 *
 * @example
 * ```tsx
 * const { hasPermission, isLoading, requestPermission } = useCameraPermission();
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (!hasPermission) {
 *   return <Button onPress={requestPermission} title="Grant Camera Access" />;
 * }
 * ```
 */
export function useCameraPermission(): UseCameraPermissionReturn {
  const [permission, requestCameraPermission] = useCameraPermissions();

  const isLoading = permission === null;
  const hasPermission = permission?.granted ?? false;
  const isDenied = permission !== null && !permission.granted && !permission.canAskAgain;

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const result = await requestCameraPermission();
      return result.granted;
    } catch {
      return false;
    }
  }, [requestCameraPermission]);

  return {
    hasPermission,
    isLoading,
    isDenied,
    requestPermission,
  };
}
