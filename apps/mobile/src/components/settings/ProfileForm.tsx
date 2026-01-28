import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ProfileFormData {
  name: string;
  avatarUrl?: string | null;
}

interface ProfileFormProps {
  initialData?: ProfileFormData;
  onSubmit: (data: { name: string }) => void;
  onAvatarChange?: () => void;
  loading?: boolean;
}

export function ProfileForm({
  initialData,
  onSubmit,
  onAvatarChange,
  loading = false,
}: ProfileFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [error, setError] = useState("");

  const initials = name
    ? name
        .split(/\s+/)
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("이름을 입력해주세요");
      return;
    }
    setError("");
    onSubmit({ name: name.trim() });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={onAvatarChange}
            activeOpacity={0.8}
          >
            {initialData?.avatarUrl ? (
              <Image
                source={{ uri: initialData.avatarUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.cameraOverlay}>
              <Text style={styles.cameraIcon}>{"\uD83D\uDCF7"}</Text>
            </View>
          </TouchableOpacity>
          {onAvatarChange ? (
            <TouchableOpacity onPress={onAvatarChange}>
              <Text style={styles.changeAvatarText}>사진 변경</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>이름</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="이름을 입력하세요"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={(v) => {
              setName(v);
              if (error) setError("");
            }}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "저장 중..." : "저장"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    padding: 24,
    alignItems: "center",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 8,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: "700",
    color: "#6366F1",
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  cameraIcon: {
    fontSize: 14,
  },
  changeAvatarText: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "500",
  },
  field: {
    width: "100%",
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2937",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#6366F1",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
