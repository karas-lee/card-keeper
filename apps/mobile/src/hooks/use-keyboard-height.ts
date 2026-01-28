import { useState, useEffect } from "react";
import { Keyboard, Platform, type KeyboardEvent } from "react-native";

export interface UseKeyboardHeightReturn {
  /** The current keyboard height in points. 0 when hidden. */
  keyboardHeight: number;
  /** Whether the keyboard is currently visible */
  isKeyboardVisible: boolean;
}

/**
 * Hook to track the software keyboard height and visibility.
 *
 * Listens to the appropriate Keyboard events for the current platform
 * (keyboardWillShow/Hide on iOS for smoother animations, keyboardDidShow/Hide
 * on Android) and returns the current height and visibility state.
 *
 * Listeners are cleaned up automatically on unmount.
 *
 * @example
 * ```tsx
 * const { keyboardHeight, isKeyboardVisible } = useKeyboardHeight();
 *
 * return (
 *   <View style={{ paddingBottom: keyboardHeight }}>
 *     <TextInput />
 *   </View>
 * );
 * ```
 */
export function useKeyboardHeight(): UseKeyboardHeightReturn {
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);

  useEffect(() => {
    // iOS supports "will" events for smoother transitions; Android only has "did"
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const handleKeyboardShow = (event: KeyboardEvent) => {
      setKeyboardHeight(event.endCoordinates.height);
      setIsKeyboardVisible(true);
    };

    const handleKeyboardHide = () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    };

    const showSubscription = Keyboard.addListener(showEvent, handleKeyboardShow);
    const hideSubscription = Keyboard.addListener(hideEvent, handleKeyboardHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return {
    keyboardHeight,
    isKeyboardVisible,
  };
}
