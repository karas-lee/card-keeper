import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface TagCreateSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
  loading?: boolean;
}

const PRESET_COLORS = [
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#06B6D4",
  "#3B82F6",
  "#F97316",
  "#84CC16",
];

export function TagCreateSheet({
  visible,
  onClose,
  onCreate,
  loading = false,
}: TagCreateSheetProps) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState("");

  const handleCreate = () => {
    if (!name.trim()) {
      setError("태그 이름을 입력해주세요");
      return;
    }
    onCreate(name.trim(), selectedColor);
    setName("");
    setError("");
  };

  const handleClose = () => {
    setName("");
    setError("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>새 태그</Text>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.closeText}>취소</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.field}>
            <Text style={styles.label}>태그 이름</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="태그 이름을 입력하세요"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (error) setError("");
              }}
              autoFocus
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>색상</Text>
            <View style={styles.colorRow}>
              {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color ? (
                    <Text style={styles.colorCheck}>{"\u2713"}</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preview */}
          <View style={styles.preview}>
            <View
              style={[
                styles.previewBadge,
                { backgroundColor: selectedColor + "20" },
              ]}
            >
              <View
                style={[styles.previewDot, { backgroundColor: selectedColor }]}
              />
              <Text style={[styles.previewName, { color: selectedColor }]}>
                {name || "태그"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.createButton, loading && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.createButtonText}>
              {loading ? "생성 중..." : "태그 만들기"}
            </Text>
          </TouchableOpacity>
        </View>
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
  content: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1F2937",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  colorCheck: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  preview: {
    alignItems: "flex-start",
    marginBottom: 20,
  },
  previewBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  previewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  previewName: {
    fontSize: 14,
    fontWeight: "600",
  },
  createButton: {
    backgroundColor: "#6366F1",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
