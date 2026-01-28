import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

interface SeparatorProps {
  direction?: "horizontal" | "vertical";
  color?: string;
  thickness?: number;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
}

export function Separator({
  direction = "horizontal",
  color = "#E5E7EB",
  thickness = StyleSheet.hairlineWidth,
  spacing = 0,
  style,
}: SeparatorProps) {
  const isHorizontal = direction === "horizontal";

  return (
    <View
      style={[
        isHorizontal ? styles.horizontal : styles.vertical,
        {
          backgroundColor: color,
          ...(isHorizontal
            ? { height: thickness, marginVertical: spacing }
            : { width: thickness, marginHorizontal: spacing }),
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    width: "100%",
  },
  vertical: {
    height: "100%",
  },
});
