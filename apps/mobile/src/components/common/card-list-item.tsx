import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TagInfo {
  id: string;
  name: string;
  color: string | null;
}

interface CardListItemProps {
  id: string;
  name: string;
  company: string | null;
  jobTitle: string | null;
  isFavorite: boolean;
  tags: TagInfo[];
  onPress: () => void;
  onFavoriteToggle: () => void;
}

export function CardListItem({
  name,
  company,
  jobTitle,
  isFavorite,
  tags,
  onPress,
  onFavoriteToggle,
}: CardListItemProps) {
  const firstLetter = name.charAt(0).toUpperCase();
  const displayTags = tags.slice(0, 3);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{firstLetter}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {company ? (
          <Text style={styles.company} numberOfLines={1}>
            {company}
          </Text>
        ) : null}
        {jobTitle ? (
          <Text style={styles.jobTitle} numberOfLines={1}>
            {jobTitle}
          </Text>
        ) : null}

        {displayTags.length > 0 ? (
          <View style={styles.tagRow}>
            {displayTags.map((tag) => (
              <View
                key={tag.id}
                style={[
                  styles.tagBadge,
                  { backgroundColor: (tag.color || "#6366F1") + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: tag.color || "#6366F1" },
                  ]}
                  numberOfLines={1}
                >
                  {tag.name}
                </Text>
              </View>
            ))}
            {tags.length > 3 ? (
              <Text style={styles.moreTagsText}>+{tags.length - 3}</Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavoriteToggle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.favoriteIcon}>
            {isFavorite ? "\u2605" : "\u2606"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.chevron}>{"\u203A"}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
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
  content: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  company: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 1,
  },
  jobTitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "500",
  },
  moreTagsText: {
    fontSize: 11,
    color: "#9CA3AF",
    alignSelf: "center",
    marginLeft: 2,
  },
  rightSection: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 20,
    color: "#F59E0B",
  },
  chevron: {
    fontSize: 22,
    color: "#D1D5DB",
    fontWeight: "300",
  },
});
