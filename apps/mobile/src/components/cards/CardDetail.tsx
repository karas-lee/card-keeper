import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ContactDetailFields, type ContactDetailItem } from "./ContactDetailFields";
import { CardQuickActions } from "./CardQuickActions";

interface TagInfo {
  id: string;
  name: string;
  color: string | null;
}

interface CardDetailData {
  id: string;
  name: string;
  company: string | null;
  jobTitle: string | null;
  address: string | null;
  website: string | null;
  memo: string | null;
  imageUrl: string | null;
  isFavorite: boolean;
  tags: TagInfo[];
  contactDetails: ContactDetailItem[];
  folder?: { id: string; name: string; color: string | null } | null;
  createdAt: string;
}

interface CardDetailProps {
  data: CardDetailData;
  onEdit?: () => void;
  onFavoriteToggle?: () => void;
  onDelete?: () => void;
  onImagePress?: () => void;
  onCall?: (phone: string) => void;
  onEmail?: (email: string) => void;
  onShare?: () => void;
}

export function CardDetail({
  data,
  onEdit,
  onFavoriteToggle,
  onDelete,
  onImagePress,
  onCall,
  onEmail,
  onShare,
}: CardDetailProps) {
  const primaryPhone = data.contactDetails.find(
    (c) => c.type === "phone" && c.isPrimary
  );
  const primaryEmail = data.contactDetails.find(
    (c) => c.type === "email" && c.isPrimary
  );
  const firstLetter = data.name.charAt(0).toUpperCase();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.header}>
        {data.imageUrl ? (
          <TouchableOpacity onPress={onImagePress} activeOpacity={0.8}>
            <Image
              source={{ uri: data.imageUrl }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : null}

        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstLetter}</Text>
          </View>
          <View style={styles.nameSection}>
            <Text style={styles.name}>{data.name}</Text>
            {data.jobTitle ? (
              <Text style={styles.jobTitle}>{data.jobTitle}</Text>
            ) : null}
            {data.company ? (
              <Text style={styles.company}>{data.company}</Text>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={onFavoriteToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.favoriteIcon}>
              {data.isFavorite ? "\u2605" : "\u2606"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <CardQuickActions
        phoneNumber={primaryPhone?.value}
        email={primaryEmail?.value}
        onCall={onCall}
        onEmail={onEmail}
        onShare={onShare}
      />

      {/* Contact Details */}
      {data.contactDetails.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>연락처 정보</Text>
          <ContactDetailFields items={data.contactDetails} />
        </View>
      ) : null}

      {/* Address */}
      {data.address ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>주소</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoValue}>{data.address}</Text>
          </View>
        </View>
      ) : null}

      {/* Website */}
      {data.website ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>웹사이트</Text>
          <View style={styles.infoCard}>
            <Text style={[styles.infoValue, styles.linkText]}>
              {data.website}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Folder & Tags */}
      {data.folder || data.tags.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>분류</Text>
          <View style={styles.infoCard}>
            {data.folder ? (
              <View style={styles.folderRow}>
                <View
                  style={[
                    styles.folderDot,
                    { backgroundColor: data.folder.color || "#6366F1" },
                  ]}
                />
                <Text style={styles.folderName}>{data.folder.name}</Text>
              </View>
            ) : null}
            {data.tags.length > 0 ? (
              <View style={styles.tagsRow}>
                {data.tags.map((tag) => (
                  <View
                    key={tag.id}
                    style={[
                      styles.tagBadge,
                      { backgroundColor: (tag.color || "#6366F1") + "20" },
                    ]}
                  >
                    <Text
                      style={[styles.tagText, { color: tag.color || "#6366F1" }]}
                    >
                      {tag.name}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Memo */}
      {data.memo ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>메모</Text>
          <View style={styles.infoCard}>
            <Text style={styles.memoText}>{data.memo}</Text>
          </View>
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Text style={styles.editButtonText}>편집</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>삭제</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  cardImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#F3F4F6",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#6366F1",
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 1,
  },
  company: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  favoriteIcon: {
    fontSize: 24,
    color: "#F59E0B",
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  infoValue: {
    fontSize: 15,
    color: "#1F2937",
    lineHeight: 22,
  },
  linkText: {
    color: "#6366F1",
  },
  folderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  folderDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  folderName: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  memoText: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#6366F1",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  deleteButtonText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "600",
  },
});
