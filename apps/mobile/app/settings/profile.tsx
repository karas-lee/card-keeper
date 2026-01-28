import { useState } from "react";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiFetch } from "../../src/lib/api";
import { useAuthStore } from "../../src/stores/auth.store";

export default function ProfileScreen() {
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();
  const [name, setName] = useState(user?.name ?? "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("입력 오류", "이름을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch("/auth/me", {
        method: "PUT",
        body: JSON.stringify({ name: name.trim() }),
      });
      const updatedUser = response.data;
      if (accessToken && refreshToken) {
        setAuth(
          {
            id: updatedUser.id ?? user?.id ?? "",
            email: updatedUser.email ?? user?.email ?? "",
            name: updatedUser.name ?? name.trim(),
            avatarUrl: updatedUser.avatarUrl ?? user?.avatarUrl ?? null,
          },
          accessToken,
          refreshToken
        );
      }
      Alert.alert("완료", "프로필이 업데이트되었습니다.");
    } catch (error) {
      Alert.alert(
        "저장 실패",
        error instanceof Error
          ? error.message
          : "프로필 저장 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const firstLetter =
    (name || user?.name || user?.email || "?").charAt(0).toUpperCase();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "프로필 편집",
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{firstLetter}</Text>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>이름</Text>
              <TextInput
                style={styles.input}
                placeholder="이름을 입력하세요"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>이메일</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>
                  {user?.email ?? "이메일 없음"}
                </Text>
              </View>
              <Text style={styles.helperText}>
                이메일은 변경할 수 없습니다.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                isLoading && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>저장하기</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
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
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#6366F1",
  },
  form: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
  },
  readOnlyField: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#F3F4F6",
  },
  readOnlyText: {
    fontSize: 15,
    color: "#6B7280",
  },
  helperText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: "#6366F1",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    height: 50,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
