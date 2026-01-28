import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CardSelectionBarProps {
  selectedCount: number;
  onMove?: () => void;
  onTag?: () => void;
  onDelete?: () => void;
  onDone?: () => void;
}

export function CardSelectionBar({
  selectedCount,
  onMove,
  onTag,
  onDelete,
  onDone,
}: CardSelectionBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.countText}>
          {selectedCount}개 선택됨
        </Text>
        <TouchableOpacity onPress={onDone}>
          <Text style={styles.doneText}>완료</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={onMove}>
          <Text style={styles.actionIcon}>{"\uD83D\uDCC1"}</Text>
          <Text style={styles.actionLabel}>이동</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onTag}>
          <Text style={styles.actionIcon}>{"\uD83C\uDFF7"}</Text>
          <Text style={styles.actionLabel}>태그</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteAction]}
          onPress={onDelete}
        >
          <Text style={styles.deleteIcon}>{"\uD83D\uDDD1"}</Text>
          <Text style={styles.deleteLabel}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  countText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6366F1",
  },
  doneText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6366F1",
  },
  actionRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionIcon: {
    fontSize: 14,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  deleteAction: {
    backgroundColor: "#FEE2E2",
  },
  deleteIcon: {
    fontSize: 14,
  },
  deleteLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#EF4444",
  },
});
