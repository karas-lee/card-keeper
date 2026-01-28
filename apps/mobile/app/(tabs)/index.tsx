import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../src/lib/api";
import { CardListItem } from "../../src/components/common/card-list-item";
import { EmptyState } from "../../src/components/common/empty-state";

interface TagInfo {
  id: string;
  name: string;
  color: string | null;
}

interface ContactDetail {
  id: string;
  cardId: string;
  type: string;
  label: string | null;
  value: string;
  isPrimary: boolean;
}

interface CardSummary {
  id: string;
  userId: string;
  folderId: string | null;
  name: string;
  company: string | null;
  jobTitle: string | null;
  address: string | null;
  website: string | null;
  memo: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  folder: { id: string; name: string; color: string | null } | null;
  tags: TagInfo[];
  contactDetails: ContactDetail[];
}

interface PaginatedCards {
  data: CardSummary[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
    totalCount: number;
  };
}

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery<PaginatedCards>({
    queryKey: ["cards", searchText],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (searchText) params.set("search", searchText);
      if (pageParam) params.set("cursor", pageParam as string);
      params.set("limit", "20");
      return apiFetch(`/cards?${params.toString()}`);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.nextCursor : undefined,
  });

  const favoriteMutation = useMutation({
    mutationFn: async ({
      cardId,
      isFavorite,
    }: {
      cardId: string;
      isFavorite: boolean;
    }) => {
      return apiFetch(`/cards/${cardId}`, {
        method: "PATCH",
        body: JSON.stringify({ isFavorite: !isFavorite }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });

  const allCards = data?.pages.flatMap((page) => page.data) ?? [];

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: CardSummary }) => (
      <CardListItem
        id={item.id}
        name={item.name}
        company={item.company}
        jobTitle={item.jobTitle}
        isFavorite={item.isFavorite}
        tags={item.tags}
        onPress={() => router.push(`/card/${item.id}`)}
        onFavoriteToggle={() =>
          favoriteMutation.mutate({
            cardId: item.id,
            isFavorite: item.isFavorite,
          })
        }
      />
    ),
    [router, favoriteMutation]
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#6366F1" />
      </View>
    );
  }, [isFetchingNextPage]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>&#x1F50D;</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="이름, 회사, 직함으로 검색..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>명함을 불러오는 중...</Text>
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
      ) : allCards.length === 0 ? (
        <EmptyState
          icon="&#x1F4C7;"
          title="명함이 없습니다"
          description="명함을 스캔하거나 직접 추가해보세요."
          actionLabel="명함 추가"
          onAction={() => router.push("/card/new")}
        />
      ) : (
        <FlatList
          data={allCards}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          refreshing={false}
          onRefresh={() => refetch()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/card/new")}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: "#9CA3AF",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1F2937",
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
    paddingBottom: 80,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "300",
    lineHeight: 30,
  },
});
