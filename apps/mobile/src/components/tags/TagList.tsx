import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { TagBadge, type TagBadgeData } from "./TagBadge";

interface TagListProps {
  tags: TagBadgeData[];
  direction?: "horizontal" | "vertical";
  onTagPress?: (id: string) => void;
  onTagRemove?: (id: string) => void;
  selectedIds?: Set<string>;
}

export function TagList({
  tags,
  direction = "horizontal",
  onTagPress,
  onTagRemove,
  selectedIds,
}: TagListProps) {
  if (direction === "horizontal") {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalContent}
      >
        {tags.map((tag) => (
          <TagBadge
            key={tag.id}
            data={tag}
            onPress={() => onTagPress?.(tag.id)}
            onRemove={onTagRemove ? () => onTagRemove(tag.id) : undefined}
            isSelected={selectedIds?.has(tag.id)}
          />
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={styles.verticalContent}>
      {tags.map((tag) => (
        <TagBadge
          key={tag.id}
          data={tag}
          onPress={() => onTagPress?.(tag.id)}
          onRemove={onTagRemove ? () => onTagRemove(tag.id) : undefined}
          isSelected={selectedIds?.has(tag.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  horizontalContent: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  verticalContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 16,
  },
});
