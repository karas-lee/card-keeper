import React from "react";
import {
  Text as RNText,
  StyleSheet,
  type TextProps as RNTextProps,
  type TextStyle,
} from "react-native";

type TextVariant = "heading" | "subheading" | "body" | "caption" | "label";

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  align?: TextStyle["textAlign"];
}

const variantStyles: Record<TextVariant, TextStyle> = {
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    lineHeight: 28,
  },
  subheading: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: "400",
    color: "#1F2937",
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400",
    color: "#9CA3AF",
    lineHeight: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    lineHeight: 20,
  },
};

export function Text({
  variant = "body",
  color,
  align,
  style,
  children,
  ...rest
}: TextProps) {
  return (
    <RNText
      style={[
        variantStyles[variant],
        color ? { color } : undefined,
        align ? { textAlign: align } : undefined,
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({});
