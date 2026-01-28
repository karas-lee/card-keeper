import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface ScanProgressProps {
  progress?: number; // 0-100, undefined = indeterminate
  message?: string;
  status?: "scanning" | "processing" | "complete" | "error";
}

const statusMessages: Record<string, string> = {
  scanning: "명함을 스캔하고 있습니다...",
  processing: "텍스트를 인식하고 있습니다...",
  complete: "인식이 완료되었습니다!",
  error: "인식에 실패했습니다.",
};

export function ScanProgress({
  progress,
  message,
  status = "scanning",
}: ScanProgressProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (progress !== undefined) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, progressAnim]);

  const displayMessage = message || statusMessages[status];
  const isComplete = status === "complete";
  const isError = status === "error";

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {!isComplete && !isError ? (
          <ActivityIndicator
            size="large"
            color="#6366F1"
            style={styles.spinner}
          />
        ) : null}

        {isComplete ? (
          <View style={styles.successIcon}>
            <Text style={styles.successText}>{"\u2713"}</Text>
          </View>
        ) : null}

        {isError ? (
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>{"\u2717"}</Text>
          </View>
        ) : null}

        <Text
          style={[
            styles.message,
            isComplete && styles.successMessage,
            isError && styles.errorMessage,
          ]}
        >
          {displayMessage}
        </Text>

        {progress !== undefined && !isComplete && !isError ? (
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        ) : null}

        {progress !== undefined && !isComplete && !isError ? (
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  spinner: {
    marginBottom: 16,
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successText: {
    fontSize: 28,
    color: "#10B981",
    fontWeight: "700",
  },
  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorIconText: {
    fontSize: 28,
    color: "#EF4444",
    fontWeight: "700",
  },
  message: {
    fontSize: 15,
    color: "#1F2937",
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 8,
  },
  successMessage: {
    color: "#10B981",
  },
  errorMessage: {
    color: "#EF4444",
  },
  progressBarContainer: {
    width: "100%",
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 8,
  },
});
