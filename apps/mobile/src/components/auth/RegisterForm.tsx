import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface RegisterFormProps {
  onSubmit: (data: {
    name: string;
    email: string;
    password: string;
  }) => void;
  onGoToLogin?: () => void;
  loading?: boolean;
  error?: string | null;
}

export function RegisterForm({
  onSubmit,
  onGoToLogin,
  loading = false,
  error,
}: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = "이름을 입력해주세요";
    }
    if (!email.trim()) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요";
    }
    if (!password) {
      newErrors.password = "비밀번호를 입력해주세요";
    } else if (password.length < 8) {
      newErrors.password = "비밀번호는 8자 이상이어야 합니다";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "비밀번호를 다시 입력해주세요";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({ name: name.trim(), email: email.trim(), password });
    }
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
        <View style={styles.header}>
          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.subtitle}>
            CardKeeper 계정을 만들어보세요
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>이름</Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            placeholder="이름을 입력하세요"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            textContentType="name"
          />
          {errors.name ? (
            <Text style={styles.fieldError}>{errors.name}</Text>
          ) : null}
        </View>

        {/* Email */}
        <View style={styles.field}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={[styles.input, errors.email ? styles.inputError : null]}
            placeholder="이메일 주소를 입력하세요"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
          />
          {errors.email ? (
            <Text style={styles.fieldError}>{errors.email}</Text>
          ) : null}
        </View>

        {/* Password */}
        <View style={styles.field}>
          <Text style={styles.label}>비밀번호</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={[
                styles.input,
                styles.passwordInput,
                errors.password ? styles.inputError : null,
              ]}
              placeholder="비밀번호 (8자 이상)"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType="newPassword"
            />
            <TouchableOpacity
              style={styles.showPasswordButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showPasswordText}>
                {showPassword ? "숨기기" : "보기"}
              </Text>
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text style={styles.fieldError}>{errors.password}</Text>
          ) : null}
        </View>

        {/* Confirm Password */}
        <View style={styles.field}>
          <Text style={styles.label}>비밀번호 확인</Text>
          <TextInput
            style={[
              styles.input,
              errors.confirmPassword ? styles.inputError : null,
            ]}
            placeholder="비밀번호를 다시 입력하세요"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            textContentType="newPassword"
          />
          {errors.confirmPassword ? (
            <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
          ) : null}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "가입 중..." : "회원가입"}
          </Text>
        </TouchableOpacity>

        {/* Go to Login */}
        {onGoToLogin ? (
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>이미 계정이 있으신가요? </Text>
            <TouchableOpacity onPress={onGoToLogin}>
              <Text style={styles.loginLink}>로그인</Text>
            </TouchableOpacity>
          </View>
        ) : null}
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
    paddingTop: 48,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
  },
  errorBanner: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "500",
  },
  field: {
    marginBottom: 16,
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
  passwordWrapper: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 60,
  },
  showPasswordButton: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  showPasswordText: {
    fontSize: 13,
    color: "#6366F1",
    fontWeight: "500",
  },
  fieldError: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#6366F1",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  loginText: {
    fontSize: 14,
    color: "#6B7280",
  },
  loginLink: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "600",
  },
});
