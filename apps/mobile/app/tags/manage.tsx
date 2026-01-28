import { useCallback, useState } from "react";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../src/lib/api";

interface Tag {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

const TAG_COLORS = [
  "#6366F1",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EF4444",
  "#14B8A6",
  "#F97316",
  "#6B7280",
];

export default function TagManageScreen() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(TAG_COLORS[0] ?? "#6366F1");

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<{ data: Tag[] }>({
    queryKey: ["tags"],
    queryFn: () => apiFetch("/tags"),
  });

  const createTagMutation = useMutation({
    mutationFn: async (params: { name: string; color: string }) => {
      return apiFetch("/tags", {
        method: "POST",
        body: JSON.stringify(params),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setShowModal(false);
      setNewTagName("");
      setSelectedColor(TAG_COLORS[0] ?? "#6366F1");
    },
    onError: (err) => {
      Alert.alert(
        "태그 생성 실패",
        err instanceof Error ? err.message : "오류가 발생했습니다."
      );
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      return apiFetch(`/tags/${tagId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (err) => {
      Alert.alert(
        "태그 삭제 실패",
        err instanceof Error ? err.message : "오류가 발생했습니다."
      );
    },
  });

  const tags = data?.data ?? [];

  const handleCreateTag = () => {
    if (!newTagName.trim()) {
      Alert.alert("입력 오류", "태그 이름을 입력해주세요.");
      return;
    }
    createTagMutation.mutate({
      name: newTagName.trim(),
      color: selectedColor,
    });
  };

  const handleDeleteTag = (tag: Tag) => {
    Alert.alert("태그 삭제", `"${tag.name}" 태그를 삭제하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => deleteTagMutation.mutate(tag.id),
      },
    ]);
  };

  const renderTagItem = useCallback(
    ({ item }: { item: Tag }) => {
      const tagColor = item.color || "#6366F1";

      return (
        <View style={styles.tagItem}>
          <View
            style={[styles.tagColorBadge, { backgroundColor: tagColor + "20" }]}
          >
            <View
              style={[styles.tagColorDot, { backgroundColor: tagColor }]}
            />
          </View>
          <Text style={styles.tagName} numberOfLines={1}>
            {item.name}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteTag(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteButtonText}>{"\u2715"}</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [deleteTagMutation]
  );

  const renderSeparator = () => <View style={styles.separator} />;

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>{"\uD83C\uDFF7"}</Text>
      <Text style={styles.emptyTitle}>태그가 없습니다</Text>
      <Text style={styles.emptyDescription}>
        명함을 분류할 태그를 만들어보세요.
      </Text>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "태그 관리",
        }}
      />
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>태그를 불러오는 중...</Text>
          </View>
        ) : isError ? (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>
              {error instanceof Error
                ? error.message
                : "오류가 발생했습니다"}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refetch()}
            >
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={tags}
            renderItem={renderTagItem}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={renderSeparator}
            ListEmptyComponent={renderEmpty}
            refreshing={false}
            onRefresh={() => refetch()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              tags.length === 0 ? styles.emptyListContent : styles.listContent
            }
          />
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>{"\uC0C8 \uD0DC\uADF8"}</Text>
        </TouchableOpacity>

        <Modal
          visible={showModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {"\uC0C8 \uD0DC\uADF8"}
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder={"\uD0DC\uADF8 \uC774\uB984"}
                placeholderTextColor="#9CA3AF"
                value={newTagName}
                onChangeText={setNewTagName}
                maxLength={30}
                autoFocus
              />

              <Text style={styles.colorLabel}>
                {"\uC0C9\uC0C1 \uC120\uD0DD"}
              </Text>
              <View style={styles.colorGrid}>
                {TAG_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowModal(false);
                    setNewTagName("");
                  }}
                >
                  <Text style={styles.modalCancelText}>
                    {"\uCDE8\uC18C"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalCreateButton,
                    createTagMutation.isPending &&
                      styles.modalCreateButtonDisabled,
                  ]}
                  onPress={handleCreateTag}
                  disabled={createTagMutation.isPending}
                >
                  {createTagMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalCreateText}>
                      {"\uB9CC\uB4E4\uAE30"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 15,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 80,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
  },
  tagColorBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  tagColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  tagName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "600",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginLeft: 66,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366F1",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonIcon: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "300",
    marginRight: 6,
  },
  addButtonText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: "#1F2937",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  modalCreateButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
    height: 46,
  },
  modalCreateButtonDisabled: {
    opacity: 0.7,
  },
  modalCreateText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
