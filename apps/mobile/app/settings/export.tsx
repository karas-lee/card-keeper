import { useState } from "react";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../src/lib/api";

type ExportFormat = "csv" | "vcard";
type ExportScope = "all" | "folder" | "selected";

interface FolderOption {
  id: string;
  name: string;
  color: string | null;
}

export default function ExportScreen() {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("csv");
  const [selectedScope, setSelectedScope] = useState<ExportScope>("all");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data: foldersData } = useQuery<{ data: FolderOption[] }>({
    queryKey: ["folders"],
    queryFn: () => apiFetch("/folders"),
  });

  const folders = foldersData?.data ?? [];

  const handleExport = async () => {
    if (selectedScope === "folder" && !selectedFolderId) {
      Alert.alert("선택 오류", "내보낼 폴더를 선택해주세요.");
      return;
    }

    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      params.set("format", selectedFormat);
      if (selectedScope === "folder" && selectedFolderId) {
        params.set("folderId", selectedFolderId);
      }

      const response = await apiFetch(`/cards/export?${params.toString()}`);

      if (response?.data?.url) {
        await Share.share({
          url: response.data.url,
          message: `CardKeeper ${selectedFormat.toUpperCase()} 내보내기`,
        });
      } else if (response?.data?.content) {
        await Share.share({
          message: response.data.content,
          title: `CardKeeper ${selectedFormat.toUpperCase()} 내보내기`,
        });
      } else {
        Alert.alert("완료", "데이터 내보내기가 완료되었습니다.");
      }
    } catch (error) {
      Alert.alert(
        "내보내기 실패",
        error instanceof Error
          ? error.message
          : "데이터 내보내기 중 오류가 발생했습니다."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "데이터 내보내기",
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내보내기 형식</Text>
          <View style={styles.optionCard}>
            <TouchableOpacity
              style={[
                styles.optionItem,
                selectedFormat === "csv" && styles.optionItemSelected,
              ]}
              onPress={() => setSelectedFormat("csv")}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <Text style={styles.optionIcon}>{"\uD83D\uDCC4"}</Text>
                <View>
                  <Text style={styles.optionTitle}>CSV</Text>
                  <Text style={styles.optionDescription}>
                    스프레드시트 호환 형식
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.radio,
                  selectedFormat === "csv" && styles.radioSelected,
                ]}
              >
                {selectedFormat === "csv" ? (
                  <View style={styles.radioInner} />
                ) : null}
              </View>
            </TouchableOpacity>

            <View style={styles.optionSeparator} />

            <TouchableOpacity
              style={[
                styles.optionItem,
                selectedFormat === "vcard" && styles.optionItemSelected,
              ]}
              onPress={() => setSelectedFormat("vcard")}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <Text style={styles.optionIcon}>{"\uD83D\uDCCB"}</Text>
                <View>
                  <Text style={styles.optionTitle}>vCard</Text>
                  <Text style={styles.optionDescription}>
                    연락처 앱 호환 형식
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.radio,
                  selectedFormat === "vcard" && styles.radioSelected,
                ]}
              >
                {selectedFormat === "vcard" ? (
                  <View style={styles.radioInner} />
                ) : null}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내보내기 범위</Text>
          <View style={styles.optionCard}>
            <TouchableOpacity
              style={[
                styles.optionItem,
                selectedScope === "all" && styles.optionItemSelected,
              ]}
              onPress={() => {
                setSelectedScope("all");
                setSelectedFolderId(null);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <Text style={styles.optionIcon}>{"\uD83D\uDCDA"}</Text>
                <View>
                  <Text style={styles.optionTitle}>모든 명함</Text>
                  <Text style={styles.optionDescription}>
                    전체 명함을 내보냅니다
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.radio,
                  selectedScope === "all" && styles.radioSelected,
                ]}
              >
                {selectedScope === "all" ? (
                  <View style={styles.radioInner} />
                ) : null}
              </View>
            </TouchableOpacity>

            <View style={styles.optionSeparator} />

            <TouchableOpacity
              style={[
                styles.optionItem,
                selectedScope === "folder" && styles.optionItemSelected,
              ]}
              onPress={() => setSelectedScope("folder")}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <Text style={styles.optionIcon}>{"\uD83D\uDCC1"}</Text>
                <View>
                  <Text style={styles.optionTitle}>특정 폴더</Text>
                  <Text style={styles.optionDescription}>
                    선택한 폴더의 명함만 내보냅니다
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.radio,
                  selectedScope === "folder" && styles.radioSelected,
                ]}
              >
                {selectedScope === "folder" ? (
                  <View style={styles.radioInner} />
                ) : null}
              </View>
            </TouchableOpacity>

            <View style={styles.optionSeparator} />

            <TouchableOpacity
              style={[
                styles.optionItem,
                selectedScope === "selected" && styles.optionItemSelected,
              ]}
              onPress={() => {
                setSelectedScope("selected");
                setSelectedFolderId(null);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <Text style={styles.optionIcon}>{"\u2714"}</Text>
                <View>
                  <Text style={styles.optionTitle}>선택한 명함</Text>
                  <Text style={styles.optionDescription}>
                    직접 선택한 명함만 내보냅니다
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.radio,
                  selectedScope === "selected" && styles.radioSelected,
                ]}
              >
                {selectedScope === "selected" ? (
                  <View style={styles.radioInner} />
                ) : null}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {selectedScope === "folder" && folders.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>폴더 선택</Text>
            <View style={styles.optionCard}>
              {folders.map((folder, index) => (
                <View key={folder.id}>
                  {index > 0 ? <View style={styles.optionSeparator} /> : null}
                  <TouchableOpacity
                    style={[
                      styles.folderItem,
                      selectedFolderId === folder.id &&
                        styles.folderItemSelected,
                    ]}
                    onPress={() => setSelectedFolderId(folder.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.folderDot,
                        { backgroundColor: folder.color || "#6366F1" },
                      ]}
                    />
                    <Text style={styles.folderName} numberOfLines={1}>
                      {folder.name}
                    </Text>
                    {selectedFolderId === folder.id ? (
                      <Text style={styles.checkmark}>{"\u2713"}</Text>
                    ) : null}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.exportSection}>
          <TouchableOpacity
            style={[
              styles.exportButton,
              isExporting && styles.exportButtonDisabled,
            ]}
            onPress={handleExport}
            disabled={isExporting}
            activeOpacity={0.8}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.exportButtonText}>내보내기</Text>
            )}
          </TouchableOpacity>
        </View>
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
  section: {
    marginTop: 24,
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
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionItemSelected: {
    backgroundColor: "#FAFAFE",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  optionIcon: {
    fontSize: 20,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: "#6B7280",
  },
  optionSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginLeft: 48,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: "#6366F1",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#6366F1",
  },
  folderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  folderItemSelected: {
    backgroundColor: "#FAFAFE",
  },
  folderDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 14,
  },
  folderName: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  checkmark: {
    fontSize: 18,
    color: "#6366F1",
    fontWeight: "700",
  },
  exportSection: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  exportButton: {
    backgroundColor: "#6366F1",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  exportButtonDisabled: {
    opacity: 0.7,
  },
  exportButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
