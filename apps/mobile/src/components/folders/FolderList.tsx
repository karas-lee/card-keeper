import React, { useCallback } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { FolderItem, type FolderItemData } from "./FolderItem";

interface FolderListProps {
  folders: FolderItemData[];
  refreshing?: boolean;
  onRefresh?: () => void;
  onFolderPress?: (id: string) => void;
  onFolderLongPress?: (id: string) => void;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
}

export function FolderList({
  folders,
  refreshing = false,
  onRefresh,
  onFolderPress,
  onFolderLongPress,
  ListHeaderComponent,
  ListEmptyComponent,
}: FolderListProps) {
  const renderItem = useCallback(
    ({ item }: { item: FolderItemData }) => (
      <FolderItem
        data={item}
        onPress={() => onFolderPress?.(item.id)}
        onLongPress={() => onFolderLongPress?.(item.id)}
      />
    ),
    [onFolderPress, onFolderLongPress]
  );

  const keyExtractor = useCallback((item: FolderItemData) => item.id, []);

  return (
    <FlatList
      data={folders}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
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
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 40,
  },
});
