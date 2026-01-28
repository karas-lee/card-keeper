import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

interface CaptureButtonProps {
  onPress: () => void;
  disabled?: boolean;
  size?: number;
}

export function CaptureButton({
  onPress,
  disabled = false,
  size = 72,
}: CaptureButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const outerSize = size;
  const innerSize = size - 16;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.outer,
          {
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize / 2,
            transform: [{ scale: scaleAnim }],
          },
          disabled && styles.disabled,
        ]}
      >
        <View
          style={[
            styles.inner,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  inner: {
    backgroundColor: "#FFFFFF",
  },
  disabled: {
    opacity: 0.5,
  },
});
