import { useCallback } from "react";
import * as Haptics from "expo-haptics";

export type ImpactStyle = "light" | "medium" | "heavy";
export type NotificationType = "success" | "warning" | "error";

export interface UseHapticReturn {
  /** Trigger impact haptic feedback */
  impact: (style?: ImpactStyle) => Promise<void>;
  /** Trigger notification haptic feedback */
  notification: (type?: NotificationType) => Promise<void>;
  /** Trigger selection haptic feedback (e.g., toggling a switch) */
  selection: () => Promise<void>;
}

const IMPACT_STYLE_MAP: Record<ImpactStyle, Haptics.ImpactFeedbackStyle> = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
};

const NOTIFICATION_TYPE_MAP: Record<NotificationType, Haptics.NotificationFeedbackType> = {
  success: Haptics.NotificationFeedbackType.Success,
  warning: Haptics.NotificationFeedbackType.Warning,
  error: Haptics.NotificationFeedbackType.Error,
};

/**
 * Hook providing convenient wrappers around expo-haptics feedback methods.
 *
 * Returns stable callback references for impact, notification, and selection
 * haptic feedback. All methods silently catch errors so haptic failures never
 * crash the app (e.g., on simulators or unsupported devices).
 *
 * @example
 * ```tsx
 * const { impact, notification, selection } = useHaptic();
 *
 * // On capture button press
 * await impact("medium");
 *
 * // On save success
 * await notification("success");
 *
 * // On toggle/switch
 * await selection();
 * ```
 */
export function useHaptic(): UseHapticReturn {
  const impact = useCallback(async (style: ImpactStyle = "medium"): Promise<void> => {
    try {
      await Haptics.impactAsync(IMPACT_STYLE_MAP[style]);
    } catch {
      // Haptic feedback is best-effort; silently ignore errors
      // (e.g., running on simulator or unsupported device)
    }
  }, []);

  const notification = useCallback(async (type: NotificationType = "success"): Promise<void> => {
    try {
      await Haptics.notificationAsync(NOTIFICATION_TYPE_MAP[type]);
    } catch {
      // Silently ignore haptic errors
    }
  }, []);

  const selection = useCallback(async (): Promise<void> => {
    try {
      await Haptics.selectionAsync();
    } catch {
      // Silently ignore haptic errors
    }
  }, []);

  return {
    impact,
    notification,
    selection,
  };
}
