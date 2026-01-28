import React from "react";
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type IconButtonVariant = "default" | "filled" | "ghost";
type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps extends Omit<PressableProps, "style"> {
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const sizeMap: Record<IconButtonSize, { container: number; hitSlop: number }> = {
  sm: { container: 32, hitSlop: 8 },
  md: { container: 40, hitSlop: 6 },
  lg: { container: 48, hitSlop: 4 },
};

export function IconButton({
  icon,
  variant = "default",
  size = "md",
  disabled = false,
  style,
  ...pressableProps
}: IconButtonProps) {
  const s = sizeMap[size];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        {
          width: s.container,
          height: s.container,
          borderRadius: s.container / 2,
        },
        variant === "filled" && styles.filled,
        variant === "ghost" && styles.ghost,
        variant === "default" && styles.default,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      hitSlop={s.hitSlop}
      disabled={disabled}
      {...pressableProps}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: "center",
    alignItems: "center",
  },
  default: {
    backgroundColor: "#F3F4F6",
  },
  filled: {
    backgroundColor: "#6366F1",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});
