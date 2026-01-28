import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface FolderItemData {
  id: string;
  name: string;
  color: string | null;
  cardCount?: number;
}

interface FolderItemProps {
  data: FolderItemData;
  onPress?: () => void;
  onLongPress?: () => void;
  isSelected?: boolean;
}

export function FolderItem({
  data,
  onPress,
  onLongPress,
  isSelected = false,
}: FolderItemProps) {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.containerSelected]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      delayLongPress={500}
    >
      <View
        style={[
          styles.colorDot,
          { backgroundColor: data.color || "#6366F1" },
        ]}
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {data.name}
        </Text>
      </View>
      {data.cardCount !== undefined ? (
        <Text style={styles.count}>{data.cardCount}</Text>
      ) : null}
      <Text style={styles.chevron}>{"\u203A"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  containerSelected: {
    backgroundColor: "#EEF2FF",
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1F2937",
  },
  count: {
    fontSize: 14,
    color: "#9CA3AF",
    marginRight: 8,
  },
  chevron: {
    fontSize: 22,
    color: "#D1D5DB",
    fontWeight: "300",
  },
});
