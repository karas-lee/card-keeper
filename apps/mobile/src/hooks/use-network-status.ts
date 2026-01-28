import { useState, useEffect } from "react";
import NetInfo, {
  type NetInfoState,
  type NetInfoStateType,
} from "@react-native-community/netinfo";

export interface UseNetworkStatusReturn {
  /** Whether the device is connected to a network */
  isConnected: boolean | null;
  /** Whether the internet is reachable (not just connected to a network) */
  isInternetReachable: boolean | null;
  /** The type of network connection (wifi, cellular, etc.) */
  type: NetInfoStateType | null;
}

/**
 * Hook to monitor network connectivity status.
 *
 * Subscribes to network state changes via `@react-native-community/netinfo`
 * and provides reactive values for connection status, internet reachability,
 * and connection type. Automatically cleans up the subscription on unmount.
 *
 * @example
 * ```tsx
 * const { isConnected, isInternetReachable, type } = useNetworkStatus();
 *
 * if (!isConnected) {
 *   return <OfflineBanner />;
 * }
 * ```
 */
export function useNetworkStatus(): UseNetworkStatusReturn {
  const [networkState, setNetworkState] = useState<UseNetworkStatusReturn>({
    isConnected: null,
    isInternetReachable: null,
    type: null,
  });

  useEffect(() => {
    // Fetch initial state
    NetInfo.fetch().then((state: NetInfoState) => {
      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return networkState;
}
