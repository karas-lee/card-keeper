import { useCallback } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../src/lib/api";

interface TagInfo {
  id: string;
  name: string;
  color: string | null;
}

interface CardSummary {
  id: string;
  name: string;
  company: string | null;
  jobTitle: string | null;
  isFavorite: boolean;
  tags: TagInfo[];
  createdAt: string;
}

interface FolderDetail {
  id: string;
  name: string;
  color: string | null;
}

interface FolderCardsResponse {
  data: CardSummary[];
  meta: {
    totalCount: number;
  };
}

export default function FolderDetailScreen() {
  const { id: folderId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const {
    data: folderData,
    isLoading: isFolderLoading,
  } = useQuery<{ data: FolderDetail }>({
    queryKey: ["folders", folderId],
    queryFn: () => apiFetch(`/folders/${folderId}`),
    enabled: !!folderId,
  });

  const {
    data: cardsData,
    isLoading: isCardsLoading,
    isError,
    error,
    refetch,
  } = useQuery<FolderCardsResponse>({
    queryKey: ["cards", "folder", folderId],
    queryFn: () => apiFetch(`/cards?folderId=${folderId}`),
    enabled: !!folderId,
  });

  const folderName = folderData?.data?.name ?? "폴더";
  const cards = cardsData?.data ?? [];
  const isLoading = isFolderLoading || isCardsLoading;

  const renderCardItem = useCallback(
    ({ item }: { item: CardSummary }) => {
      const firstLetter = item.name.charAt(0).toUpperCase();

      return (
        <TouchableOpacity
          style={styles.cardItem}
          onPress={() => router.push(`/card/${item.id}`)}
          activeOpacity={0.7}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstLetter}</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.company ? (
              <Text style={styles.cardCompany} numberOfLines={1}>
                {item.company}
              </Text>
            ) : null}
            {item.jobTitle ? (
              <Text style={styles.cardJobTitle} numberOfLines={1}>
                {item.jobTitle}
              </Text>
            ) : null}
          </View>
          <Text style={styles.chevron}>{"\u203A"}</Text>
        </TouchableOpacity>
      );
    },
    [router]
  );

  const renderSeparator = () => <View style={styles.separator} />;

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>{"\uD83D\uDCC7"}</Text>
      <Text style={styles.emptyTitle}>명함이 없습니다</Text>
      <Text style={styles.emptyDescription}>
        이 폴더에 명함을 추가해보세요.
      </Text>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: folderName,
        }}
      />
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>명함을 불러오는 중...</Text>
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
            data={cards}
            renderItem={renderCardItem}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={renderSeparator}
            ListEmptyComponent={renderEmpty}
            refreshing={false}
            onRefresh={() => refetch()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              cards.length === 0 ? styles.emptyListContent : styles.listContent
            }
          />
        )}
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
  },
  emptyListContent: {
    flexGrow: 1,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6366F1",
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  cardCompany: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 1,
  },
  cardJobTitle: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  chevron: {
    fontSize: 22,
    color: "#D1D5DB",
    fontWeight: "300",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginLeft: 72,
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
});
