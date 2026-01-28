import { useRouter } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthStore } from "../../src/stores/auth.store";

interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  isDestructive?: boolean;
  showBorder?: boolean;
}

function MenuItem({
  icon,
  label,
  onPress,
  isDestructive = false,
  showBorder = true,
}: MenuItemProps) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, !showBorder && styles.menuItemNoBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text
        style={[styles.menuLabel, isDestructive && styles.menuLabelDestructive]}
      >
        {label}
      </Text>
      <Text style={styles.menuChevron}>{"\u203A"}</Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const firstLetter = user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{firstLetter}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {user?.name || "사용자"}
          </Text>
          <Text style={styles.profileEmail}>
            {user?.email || "이메일 없음"}
          </Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>계정</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="&#x1F464;"
            label="프로필 편집"
            onPress={() => {
              router.push("/settings/profile");
            }}
          />
          <MenuItem
            icon="&#x1F4E4;"
            label="데이터 내보내기"
            onPress={() => {
              router.push("/settings/export");
            }}
          />
          <MenuItem
            icon="&#x1F3F7;&#xFE0F;"
            label="태그 관리"
            onPress={() => {
              router.push("/tags/manage");
            }}
            showBorder={false}
          />
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>지원</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="&#x2753;"
            label="도움말"
            onPress={() => {
              router.push("/settings/help");
            }}
            showBorder={false}
          />
        </View>
      </View>

      <View style={styles.menuSection}>
        <View style={styles.menuCard}>
          <MenuItem
            icon="&#x1F6AA;"
            label="로그아웃"
            onPress={handleLogout}
            isDestructive
            showBorder={false}
          />
        </View>
      </View>

      <Text style={styles.versionText}>CardKeeper v0.1.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingBottom: 32,
  },
  profileSection: {
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
    fontSize: 22,
    fontWeight: "700",
    color: "#6366F1",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: "#6B7280",
  },
  menuSection: {
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
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  menuItemNoBorder: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  menuLabelDestructive: {
    color: "#EF4444",
  },
  menuChevron: {
    fontSize: 22,
    color: "#D1D5DB",
    fontWeight: "300",
  },
  versionText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 32,
  },
});
