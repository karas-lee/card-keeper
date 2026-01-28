import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "style"> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: {
      backgroundColor: "#6366F1",
      borderWidth: 0,
    },
    text: {
      color: "#FFFFFF",
    },
  },
  secondary: {
    container: {
      backgroundColor: "#EEF2FF",
      borderWidth: 0,
    },
    text: {
      color: "#6366F1",
    },
  },
  outline: {
    container: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },
    text: {
      color: "#1F2937",
    },
  },
  ghost: {
    container: {
      backgroundColor: "transparent",
      borderWidth: 0,
    },
    text: {
      color: "#6366F1",
    },
  },
  destructive: {
    container: {
      backgroundColor: "#EF4444",
      borderWidth: 0,
    },
    text: {
      color: "#FFFFFF",
    },
  },
};

const sizeStyles: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
  sm: {
    container: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    text: {
      fontSize: 13,
    },
  },
  md: {
    container: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
    },
    text: {
      fontSize: 15,
    },
  },
  lg: {
    container: {
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 12,
    },
    text: {
      fontSize: 17,
    },
  },
};

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...pressableProps
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const vStyle = variantStyles[variant];
  const sStyle = sizeStyles[size];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        vStyle.container,
        sStyle.container,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={vStyle.text.color}
          style={styles.loader}
        />
      ) : null}
      {!loading && leftIcon ? leftIcon : null}
      <Text
        style={[
          styles.text,
          vStyle.text,
          sStyle.text,
          loading && styles.loadingText,
          textStyle,
        ]}
      >
        {title}
      </Text>
      {!loading && rightIcon ? rightIcon : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fullWidth: {
    width: "100%",
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: "600",
  },
  loader: {
    marginRight: 4,
  },
  loadingText: {
    opacity: 0.7,
  },
});
