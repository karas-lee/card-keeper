import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  type FlatListProps,
} from "react-native";

interface InfiniteListProps<T> extends Omit<FlatListProps<T>, "data" | "renderItem"> {
  data: T[];
  renderItem: FlatListProps<T>["renderItem"];
  keyExtractor: (item: T, index: number) => string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  emptyComponent?: React.ReactElement;
}

export function InfiniteList<T>({
  data,
  renderItem,
  keyExtractor,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  refreshing = false,
  onRefresh,
  emptyComponent,
  ...flatListProps
}: InfiniteListProps<T>) {
  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#6366F1" />
      </View>
    );
  }, [isLoadingMore]);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.3}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={emptyComponent}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366F1"
            colors={["#6366F1"]}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      windowSize={5}
      maxToRenderPerBatch={10}
      {...flatListProps}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 80,
    flexGrow: 1,
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
