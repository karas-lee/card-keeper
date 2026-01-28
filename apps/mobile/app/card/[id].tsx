import { useCallback } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../src/lib/api";

interface ContactDetail {
  id: string;
  cardId: string;
  type: string;
  label: string | null;
  value: string;
  isPrimary: boolean;
}

interface TagInfo {
  id: string;
  name: string;
  color: string | null;
}

interface FolderInfo {
  id: string;
  name: string;
  color: string | null;
}

interface CardDetail {
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
  ocrRawText: string | null;
  ocrConfidence: number | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  folder: FolderInfo | null;
  tags: TagInfo[];
  contactDetails: ContactDetail[];
}

function getContactTypeLabel(type: string): string {
  switch (type) {
    case "PHONE":
      return "전화";
    case "MOBILE":
      return "휴대폰";
    case "EMAIL":
      return "이메일";
    case "FAX":
      return "팩스";
    default:
      return "기타";
  }
}

function getContactTypeIcon(type: string): string {
  switch (type) {
    case "PHONE":
      return "\u260E";
    case "MOBILE":
      return "\u{1F4F1}";
    case "EMAIL":
      return "\u2709";
    case "FAX":
      return "\u{1F4E0}";
    default:
      return "\u{1F4CB}";
  }
}

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<{ data: CardDetail }>({
    queryKey: ["cards", id],
    queryFn: () => apiFetch(`/cards/${id}`),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiFetch(`/cards/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      router.back();
    },
    onError: (err) => {
      Alert.alert(
        "삭제 실패",
        err instanceof Error ? err.message : "오류가 발생했습니다."
      );
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async (isFavorite: boolean) => {
      return apiFetch(`/cards/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isFavorite: !isFavorite }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards", id] });
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });

  const handleContactPress = useCallback((type: string, value: string) => {
    switch (type) {
      case "PHONE":
      case "MOBILE":
        Linking.openURL(`tel:${value}`);
        break;
      case "EMAIL":
        Linking.openURL(`mailto:${value}`);
        break;
      default:
        break;
    }
  }, []);

  const handleDelete = () => {
    Alert.alert("명함 삭제", "이 명함을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => deleteMutation.mutate(),
      },
    ]);
  };

  const handleShare = async () => {
    if (!card) return;
    const lines = [card.name];
    if (card.company) lines.push(card.company);
    if (card.jobTitle) lines.push(card.jobTitle);
    card.contactDetails.forEach((c) => {
      lines.push(`${getContactTypeLabel(c.type)}: ${c.value}`);
    });
    if (card.address) lines.push(`주소: ${card.address}`);
    if (card.website) lines.push(`웹사이트: ${card.website}`);

    try {
      await Share.share({ message: lines.join("\n") });
    } catch {
      // user cancelled
    }
  };

  const card = data?.data;

  if (isLoading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (isError || !card) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : "명함을 불러올 수 없습니다"}
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const firstLetter = card.name.charAt(0).toUpperCase();

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/card/new",
                    params: { editId: card.id },
                  })
                }
                style={styles.headerButton}
              >
                <Text style={styles.headerButtonText}>편집</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
                <Text style={styles.headerButtonText}>공유</Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {card.imageUrl ? (
          <Image
            source={{ uri: card.imageUrl }}
            style={styles.cardImage}
            contentFit="contain"
            transition={200}
          />
        ) : null}

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstLetter}</Text>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{card.name}</Text>
              <TouchableOpacity
                onPress={() => favoriteMutation.mutate(card.isFavorite)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.favoriteIcon}>
                  {card.isFavorite ? "\u2605" : "\u2606"}
                </Text>
              </TouchableOpacity>
            </View>
            {card.company ? (
              <Text style={styles.company}>{card.company}</Text>
            ) : null}
            {card.jobTitle ? (
              <Text style={styles.jobTitle}>{card.jobTitle}</Text>
            ) : null}
          </View>
        </View>

        {card.contactDetails.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>연락처</Text>
            <View style={styles.sectionCard}>
              {card.contactDetails.map((contact, index) => (
                <TouchableOpacity
                  key={contact.id}
                  style={[
                    styles.contactItem,
                    index === card.contactDetails.length - 1 &&
                      styles.contactItemLast,
                  ]}
                  onPress={() => handleContactPress(contact.type, contact.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.contactIcon}>
                    {getContactTypeIcon(contact.type)}
                  </Text>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>
                      {contact.label || getContactTypeLabel(contact.type)}
                      {contact.isPrimary ? " (기본)" : ""}
                    </Text>
                    <Text style={styles.contactValue}>{contact.value}</Text>
                  </View>
                  {(contact.type === "PHONE" ||
                    contact.type === "MOBILE" ||
                    contact.type === "EMAIL") ? (
                    <Text style={styles.contactAction}>
                      {contact.type === "EMAIL" ? "\u2709" : "\u260E"}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {card.address || card.website ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>추가 정보</Text>
            <View style={styles.sectionCard}>
              {card.address ? (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>주소</Text>
                  <Text style={styles.infoValue}>{card.address}</Text>
                </View>
              ) : null}
              {card.website ? (
                <TouchableOpacity
                  style={styles.infoItem}
                  onPress={() => Linking.openURL(card.website!)}
                >
                  <Text style={styles.infoLabel}>웹사이트</Text>
                  <Text style={[styles.infoValue, styles.linkValue]}>
                    {card.website}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : null}

        {card.tags.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>태그</Text>
            <View style={styles.tagRow}>
              {card.tags.map((tag) => (
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
                  >
                    {tag.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {card.folder ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>폴더</Text>
            <View style={styles.folderRow}>
              <View
                style={[
                  styles.folderDot,
                  { backgroundColor: card.folder.color || "#6366F1" },
                ]}
              />
              <Text style={styles.folderName}>{card.folder.name}</Text>
            </View>
          </View>
        ) : null}

        {card.memo ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>메모</Text>
            <View style={styles.sectionCard}>
              <Text style={styles.memoText}>{card.memo}</Text>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteButtonText}>명함 삭제</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 15,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 16,
  },
  headerButton: {
    paddingVertical: 4,
  },
  headerButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6366F1",
  },
  cardImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#F3F4F6",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#6366F1",
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
    marginRight: 8,
  },
  favoriteIcon: {
    fontSize: 24,
    color: "#F59E0B",
  },
  company: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 2,
  },
  jobTitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  contactItemLast: {
    borderBottomWidth: 0,
  },
  contactIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  contactAction: {
    fontSize: 18,
    color: "#6366F1",
    marginLeft: 8,
  },
  infoItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: "#1F2937",
    lineHeight: 20,
  },
  linkValue: {
    color: "#6366F1",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600",
  },
  folderRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  folderDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  folderName: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  memoText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    padding: 16,
  },
  deleteButton: {
    marginTop: 32,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#EF4444",
  },
});
