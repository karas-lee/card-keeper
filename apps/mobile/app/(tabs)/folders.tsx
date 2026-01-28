import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
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
import { EmptyState } from "../../src/components/common/empty-state";

interface FolderTree {
  id: string;
  userId: string;
  parentId: string | null;
  name: string;
  color: string | null;
  order: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  children: FolderTree[];
  cardCount: number;
}

const FOLDER_COLORS = [
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

export default function FoldersScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(FOLDER_COLORS[0] ?? "#6366F1");

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<{ data: FolderTree[] }>({
    queryKey: ["folders"],
    queryFn: () => apiFetch("/folders"),
  });

  const createFolderMutation = useMutation({
    mutationFn: async (params: { name: string; color: string }) => {
      return apiFetch("/folders", {
        method: "POST",
        body: JSON.stringify(params),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      setShowModal(false);
      setNewFolderName("");
      setSelectedColor(FOLDER_COLORS[0] ?? "#6366F1");
    },
    onError: (err) => {
      Alert.alert(
        "폴더 생성 실패",
        err instanceof Error ? err.message : "오류가 발생했습니다."
      );
    },
  });

  const folders = data?.data ?? [];

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      Alert.alert("입력 오류", "폴더 이름을 입력해주세요.");
      return;
    }
    createFolderMutation.mutate({
      name: newFolderName.trim(),
      color: selectedColor,
    });
  };

  const renderFolderItem = useCallback(
    ({ item }: { item: FolderTree }) => (
      <TouchableOpacity
        style={styles.folderItem}
        onPress={() =>
          router.push({
            pathname: "/(tabs)",
            params: { folderId: item.id, folderName: item.name },
          })
        }
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.folderColorDot,
            { backgroundColor: item.color || "#6366F1" },
          ]}
        />
        <View style={styles.folderInfo}>
          <Text style={styles.folderName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.folderCardCount}>
            {item.cardCount}장의 명함
          </Text>
        </View>
        {item.isDefault ? (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>기본</Text>
          </View>
        ) : null}
        <Text style={styles.chevron}>{"\u203A"}</Text>
      </TouchableOpacity>
    ),
    [router]
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>폴더를 불러오는 중...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>
            {error instanceof Error ? error.message : "오류가 발생했습니다"}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : folders.length === 0 ? (
        <EmptyState
          icon="&#x1F4C1;"
          title="폴더가 없습니다"
          description="명함을 정리할 폴더를 만들어보세요."
          actionLabel="폴더 만들기"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <FlatList
          data={folders}
          renderItem={renderFolderItem}
          keyExtractor={(item) => item.id}
          refreshing={false}
          onRefresh={() => refetch()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowModal(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.addButtonIcon}>+</Text>
        <Text style={styles.addButtonText}>새 폴더</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>새 폴더</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="폴더 이름"
              placeholderTextColor="#9CA3AF"
              value={newFolderName}
              onChangeText={setNewFolderName}
              maxLength={50}
              autoFocus
            />

            <Text style={styles.colorLabel}>색상 선택</Text>
            <View style={styles.colorGrid}>
              {FOLDER_COLORS.map((color) => (
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
                  setNewFolderName("");
                }}
              >
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalCreateButton,
                  createFolderMutation.isPending &&
                    styles.modalCreateButtonDisabled,
                ]}
                onPress={handleCreateFolder}
                disabled={createFolderMutation.isPending}
              >
                {createFolderMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalCreateText}>만들기</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  folderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
  },
  folderColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 14,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  folderCardCount: {
    fontSize: 13,
    color: "#6B7280",
  },
  defaultBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  defaultBadgeText: {
    fontSize: 11,
    color: "#6366F1",
    fontWeight: "600",
  },
  chevron: {
    fontSize: 22,
    color: "#D1D5DB",
    fontWeight: "300",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginLeft: 42,
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
