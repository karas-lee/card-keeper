import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TagOption {
  id: string;
  name: string;
  color: string | null;
}

interface TagSelectSheetProps {
  visible: boolean;
  onClose: () => void;
  onDone: (selectedIds: string[]) => void;
  tags: TagOption[];
  initialSelectedIds?: string[];
  onCreateNew?: () => void;
}

export function TagSelectSheet({
  visible,
  onClose,
  onDone,
  tags,
  initialSelectedIds = [],
  onCreateNew,
}: TagSelectSheetProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);

  const toggleTag = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleDone = () => {
    onDone(selectedIds);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.title}>태그 선택</Text>
          <TouchableOpacity onPress={handleDone}>
            <Text style={styles.doneText}>완료</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={tags}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <TouchableOpacity
                style={[styles.tagRow, isSelected && styles.tagRowSelected]}
                onPress={() => toggleTag(item.id)}
              >
                <View
                  style={[
                    styles.checkbox,
                    isSelected && {
                      backgroundColor: item.color || "#6366F1",
                      borderColor: item.color || "#6366F1",
                    },
                  ]}
                >
                  {isSelected ? (
                    <Text style={styles.checkmark}>{"\u2713"}</Text>
                  ) : null}
                </View>
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: item.color || "#6366F1" },
                  ]}
                />
                <Text style={styles.tagName}>{item.name}</Text>
              </TouchableOpacity>
            );
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />

        {onCreateNew ? (
          <TouchableOpacity style={styles.createButton} onPress={onCreateNew}>
            <Text style={styles.createButtonText}>+ 새 태그 만들기</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "65%",
    paddingBottom: 34,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
  },
  cancelText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  doneText: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 8,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    marginVertical: 2,
  },
  tagRowSelected: {
    backgroundColor: "#F5F3FF",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  tagName: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  createButton: {
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    alignItems: "center",
  },
  createButtonText: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "600",
  },
});
