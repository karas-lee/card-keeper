import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TagInfo {
  id: string;
  name: string;
  color: string | null;
}

interface ContactDetail {
  id: string;
  type: string;
  label: string | null;
  value: string;
  isPrimary: boolean;
}

export interface CardItemData {
  id: string;
  name: string;
  company: string | null;
  jobTitle: string | null;
  isFavorite: boolean;
  tags: TagInfo[];
  contactDetails?: ContactDetail[];
  thumbnailUrl?: string | null;
}

interface CardItemProps {
  data: CardItemData;
  onPress?: () => void;
  onFavoriteToggle?: () => void;
  onLongPress?: () => void;
  isSelected?: boolean;
  selectionMode?: boolean;
}

export function CardItem({
  data,
  onPress,
  onFavoriteToggle,
  onLongPress,
  isSelected = false,
  selectionMode = false,
}: CardItemProps) {
  const { name, company, jobTitle, isFavorite, tags, contactDetails } = data;
  const firstLetter = name.charAt(0).toUpperCase();
  const displayTags = tags.slice(0, 3);
  const primaryPhone = contactDetails?.find(
    (c) => c.type === "phone" && c.isPrimary
  );
  const primaryEmail = contactDetails?.find(
    (c) => c.type === "email" && c.isPrimary
  );

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.containerSelected]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      delayLongPress={500}
    >
      {selectionMode ? (
        <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
          {isSelected ? <Text style={styles.checkmark}>{"\u2713"}</Text> : null}
        </View>
      ) : null}

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{firstLetter}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {jobTitle ? (
          <Text style={styles.jobTitle} numberOfLines={1}>
            {jobTitle}
          </Text>
        ) : null}
        {company ? (
          <Text style={styles.company} numberOfLines={1}>
            {company}
          </Text>
        ) : null}
        {primaryPhone || primaryEmail ? (
          <View style={styles.contactPreview}>
            {primaryPhone ? (
              <Text style={styles.contactText} numberOfLines={1}>
                {primaryPhone.value}
              </Text>
            ) : null}
            {primaryEmail ? (
              <Text style={styles.contactText} numberOfLines={1}>
                {primaryEmail.value}
              </Text>
            ) : null}
          </View>
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
                  style={[styles.tagText, { color: tag.color || "#6366F1" }]}
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
        {!selectionMode ? (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onFavoriteToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.favoriteIcon}>
              {isFavorite ? "\u2605" : "\u2606"}
            </Text>
          </TouchableOpacity>
        ) : null}
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
  containerSelected: {
    backgroundColor: "#EEF2FF",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
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
  jobTitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 1,
  },
  company: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  contactPreview: {
    marginTop: 2,
  },
  contactText: {
    fontSize: 11,
    color: "#9CA3AF",
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
