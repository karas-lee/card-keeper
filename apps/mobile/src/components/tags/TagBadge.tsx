import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export interface TagBadgeData {
  id: string;
  name: string;
  color: string | null;
}

interface TagBadgeProps {
  data: TagBadgeData;
  onPress?: () => void;
  onRemove?: () => void;
  isSelected?: boolean;
  size?: "sm" | "md";
  style?: StyleProp<ViewStyle>;
}

export function TagBadge({
  data,
  onPress,
  onRemove,
  isSelected = false,
  size = "md",
  style,
}: TagBadgeProps) {
  const color = data.color || "#6366F1";
  const bgColor = isSelected ? color + "30" : color + "15";

  return (
    <TouchableOpacity
      style={[
        styles.container,
        size === "sm" ? styles.containerSm : styles.containerMd,
        { backgroundColor: bgColor },
        isSelected && { borderColor: color, borderWidth: 1 },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text
        style={[
          styles.name,
          size === "sm" ? styles.nameSm : styles.nameMd,
          { color },
        ]}
        numberOfLines={1}
      >
        {data.name}
      </Text>
      {onRemove ? (
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Text style={[styles.removeIcon, { color }]}>{"\u2715"}</Text>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 0,
  },
  containerSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  containerMd: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  name: {
    fontWeight: "600",
  },
  nameSm: {
    fontSize: 11,
  },
  nameMd: {
    fontSize: 13,
  },
  removeIcon: {
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 2,
  },
});
