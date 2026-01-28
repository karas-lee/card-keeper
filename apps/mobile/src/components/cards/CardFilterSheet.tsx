import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FolderOption {
  id: string;
  name: string;
  color: string | null;
}

interface TagOption {
  id: string;
  name: string;
  color: string | null;
}

type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";
type DateRange = "all" | "week" | "month" | "quarter" | "year";

interface FilterState {
  folderId: string | null;
  tagIds: string[];
  sortBy: SortOption;
  dateRange: DateRange;
  favoritesOnly: boolean;
}

interface CardFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
  folders: FolderOption[];
  tags: TagOption[];
}

const sortLabels: Record<SortOption, string> = {
  newest: "최신순",
  oldest: "오래된순",
  name_asc: "이름 (ㄱ-ㅎ)",
  name_desc: "이름 (ㅎ-ㄱ)",
};

const dateLabels: Record<DateRange, string> = {
  all: "전체",
  week: "최근 1주",
  month: "최근 1개월",
  quarter: "최근 3개월",
  year: "최근 1년",
};

export function CardFilterSheet({
  visible,
  onClose,
  onApply,
  initialFilters,
  folders,
  tags,
}: CardFilterSheetProps) {
  const [folderId, setFolderId] = useState<string | null>(
    initialFilters?.folderId ?? null
  );
  const [tagIds, setTagIds] = useState<string[]>(initialFilters?.tagIds ?? []);
  const [sortBy, setSortBy] = useState<SortOption>(
    initialFilters?.sortBy ?? "newest"
  );
  const [dateRange, setDateRange] = useState<DateRange>(
    initialFilters?.dateRange ?? "all"
  );
  const [favoritesOnly, setFavoritesOnly] = useState(
    initialFilters?.favoritesOnly ?? false
  );

  const toggleTag = (id: string) => {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    setFolderId(null);
    setTagIds([]);
    setSortBy("newest");
    setDateRange("all");
    setFavoritesOnly(false);
  };

  const handleApply = () => {
    onApply({ folderId, tagIds, sortBy, dateRange, favoritesOnly });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>필터 및 정렬</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>초기화</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Sort */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>정렬</Text>
            <View style={styles.chipRow}>
              {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.chip,
                    sortBy === key && styles.chipActive,
                  ]}
                  onPress={() => setSortBy(key)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      sortBy === key && styles.chipTextActive,
                    ]}
                  >
                    {sortLabels[key]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>기간</Text>
            <View style={styles.chipRow}>
              {(Object.keys(dateLabels) as DateRange[]).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.chip,
                    dateRange === key && styles.chipActive,
                  ]}
                  onPress={() => setDateRange(key)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      dateRange === key && styles.chipTextActive,
                    ]}
                  >
                    {dateLabels[key]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Favorites */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.favoriteToggle}
              onPress={() => setFavoritesOnly(!favoritesOnly)}
            >
              <Text style={styles.sectionTitle}>즐겨찾기만 보기</Text>
              <View
                style={[
                  styles.toggle,
                  favoritesOnly && styles.toggleActive,
                ]}
              >
                <View
                  style={[
                    styles.toggleDot,
                    favoritesOnly && styles.toggleDotActive,
                  ]}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Folder */}
          {folders.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>폴더</Text>
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[styles.chip, !folderId && styles.chipActive]}
                  onPress={() => setFolderId(null)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      !folderId && styles.chipTextActive,
                    ]}
                  >
                    전체
                  </Text>
                </TouchableOpacity>
                {folders.map((folder) => (
                  <TouchableOpacity
                    key={folder.id}
                    style={[
                      styles.chip,
                      folderId === folder.id && styles.chipActive,
                    ]}
                    onPress={() => setFolderId(folder.id)}
                  >
                    <View
                      style={[
                        styles.chipDot,
                        { backgroundColor: folder.color || "#6366F1" },
                      ]}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        folderId === folder.id && styles.chipTextActive,
                      ]}
                    >
                      {folder.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {/* Tags */}
          {tags.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>태그</Text>
              <View style={styles.chipRow}>
                {tags.map((tag) => (
                  <TouchableOpacity
                    key={tag.id}
                    style={[
                      styles.chip,
                      tagIds.includes(tag.id) && {
                        backgroundColor: (tag.color || "#6366F1") + "20",
                        borderColor: tag.color || "#6366F1",
                      },
                    ]}
                    onPress={() => toggleTag(tag.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        tagIds.includes(tag.id) && {
                          color: tag.color || "#6366F1",
                        },
                      ]}
                    >
                      {tag.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>적용</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 34,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
  },
  resetText: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "500",
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F3F4F6",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  chipActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#6366F1",
  },
  chipText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#6366F1",
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  favoriteToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#D1D5DB",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: "#6366F1",
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  toggleDotActive: {
    alignSelf: "flex-end",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  applyButton: {
    backgroundColor: "#6366F1",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
