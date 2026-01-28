import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SocialLoginButtonsProps {
  onGoogleLogin?: () => void;
  onAppleLogin?: () => void;
  onKakaoLogin?: () => void;
  loading?: boolean;
}

export function SocialLoginButtons({
  onGoogleLogin,
  onAppleLogin,
  onKakaoLogin,
  loading = false,
}: SocialLoginButtonsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>또는</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Google */}
      {onGoogleLogin ? (
        <TouchableOpacity
          style={[styles.socialButton, styles.googleButton]}
          onPress={onGoogleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleText}>Google로 계속하기</Text>
        </TouchableOpacity>
      ) : null}

      {/* Apple (iOS only) */}
      {onAppleLogin && Platform.OS === "ios" ? (
        <TouchableOpacity
          style={[styles.socialButton, styles.appleButton]}
          onPress={onAppleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.appleIcon}>{"\uF8FF"}</Text>
          <Text style={styles.appleText}>Apple로 계속하기</Text>
        </TouchableOpacity>
      ) : null}

      {/* Kakao */}
      {onKakaoLogin ? (
        <TouchableOpacity
          style={[styles.socialButton, styles.kakaoButton]}
          onPress={onKakaoLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.kakaoIcon}>K</Text>
          <Text style={styles.kakaoText}>카카오로 계속하기</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    fontSize: 13,
    color: "#9CA3AF",
    marginHorizontal: 16,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 12,
    marginBottom: 10,
    gap: 10,
  },
  // Google
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4285F4",
  },
  googleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  // Apple
  appleButton: {
    backgroundColor: "#000000",
  },
  appleIcon: {
    fontSize: 18,
    color: "#FFFFFF",
  },
  appleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Kakao
  kakaoButton: {
    backgroundColor: "#FEE500",
  },
  kakaoIcon: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3C1E1E",
  },
  kakaoText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3C1E1E",
  },
});
