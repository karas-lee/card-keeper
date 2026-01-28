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

interface FolderOption {
  id: string;
  name: string;
  color: string | null;
  cardCount?: number;
}

interface FolderSelectSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (folderId: string) => void;
  folders: FolderOption[];
  selectedFolderId?: string | null;
  onCreateNew?: () => void;
}

export function FolderSelectSheet({
  visible,
  onClose,
  onSelect,
  folders,
  selectedFolderId,
  onCreateNew,
}: FolderSelectSheetProps) {
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
          <Text style={styles.title}>폴더 선택</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>닫기</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={folders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.folderRow,
                selectedFolderId === item.id && styles.folderRowSelected,
              ]}
              onPress={() => {
                onSelect(item.id);
                onClose();
              }}
            >
              <View
                style={[
                  styles.colorDot,
                  { backgroundColor: item.color || "#6366F1" },
                ]}
              />
              <Text style={styles.folderName} numberOfLines={1}>
                {item.name}
              </Text>
              {item.cardCount !== undefined ? (
                <Text style={styles.cardCount}>{item.cardCount}</Text>
              ) : null}
              {selectedFolderId === item.id ? (
                <Text style={styles.checkmark}>{"\u2713"}</Text>
              ) : null}
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />

        {onCreateNew ? (
          <TouchableOpacity style={styles.createButton} onPress={onCreateNew}>
            <Text style={styles.createButtonText}>+ 새 폴더 만들기</Text>
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
    maxHeight: "60%",
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
  closeText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 8,
  },
  folderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    marginVertical: 2,
  },
  folderRowSelected: {
    backgroundColor: "#EEF2FF",
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  folderName: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  cardCount: {
    fontSize: 13,
    color: "#9CA3AF",
    marginRight: 8,
  },
  checkmark: {
    fontSize: 16,
    color: "#6366F1",
    fontWeight: "700",
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
