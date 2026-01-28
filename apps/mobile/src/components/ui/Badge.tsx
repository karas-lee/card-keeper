import React from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

interface BadgeProps {
  label: string;
  color?: string;
  size?: "sm" | "md";
  style?: StyleProp<ViewStyle>;
}

export function Badge({
  label,
  color = "#6366F1",
  size = "md",
  style,
}: BadgeProps) {
  const bgColor = color + "20";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bgColor },
        size === "sm" ? styles.containerSm : styles.containerMd,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color },
          size === "sm" ? styles.labelSm : styles.labelMd,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    borderRadius: 10,
  },
  containerSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  containerMd: {
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  label: {
    fontWeight: "600",
  },
  labelSm: {
    fontSize: 10,
  },
  labelMd: {
    fontSize: 12,
  },
});
