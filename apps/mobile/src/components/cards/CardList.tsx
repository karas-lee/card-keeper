import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  type FlatListProps,
} from "react-native";
import { CardItem, type CardItemData } from "./CardItem";

interface CardListProps {
  cards: CardItemData[];
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
  onCardPress?: (id: string) => void;
  onFavoriteToggle?: (id: string, current: boolean) => void;
  onLongPress?: (id: string) => void;
  selectedIds?: Set<string>;
  selectionMode?: boolean;
  ListHeaderComponent?: FlatListProps<CardItemData>["ListHeaderComponent"];
  ListEmptyComponent?: FlatListProps<CardItemData>["ListEmptyComponent"];
}

export function CardList({
  cards,
  refreshing = false,
  onRefresh,
  onEndReached,
  isLoadingMore = false,
  onCardPress,
  onFavoriteToggle,
  onLongPress,
  selectedIds,
  selectionMode = false,
  ListHeaderComponent,
  ListEmptyComponent,
}: CardListProps) {
  const renderItem = useCallback(
    ({ item }: { item: CardItemData }) => (
      <CardItem
        data={item}
        onPress={() => onCardPress?.(item.id)}
        onFavoriteToggle={() => onFavoriteToggle?.(item.id, item.isFavorite)}
        onLongPress={() => onLongPress?.(item.id)}
        isSelected={selectedIds?.has(item.id)}
        selectionMode={selectionMode}
      />
    ),
    [onCardPress, onFavoriteToggle, onLongPress, selectedIds, selectionMode]
  );

  const keyExtractor = useCallback((item: CardItemData) => item.id, []);

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
      data={cards}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      ListFooterComponent={renderFooter}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
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
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 80,
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
