import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CardQuickActionsProps {
  phoneNumber?: string;
  email?: string;
  onCall?: (phone: string) => void;
  onEmail?: (email: string) => void;
  onShare?: () => void;
}

export function CardQuickActions({
  phoneNumber,
  email,
  onCall,
  onEmail,
  onShare,
}: CardQuickActionsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.actionButton, !phoneNumber && styles.actionDisabled]}
        onPress={() => phoneNumber && onCall?.(phoneNumber)}
        disabled={!phoneNumber}
        activeOpacity={0.7}
      >
        <Text style={styles.actionIcon}>{"\uD83D\uDCDE"}</Text>
        <Text
          style={[styles.actionLabel, !phoneNumber && styles.labelDisabled]}
        >
          전화
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, !email && styles.actionDisabled]}
        onPress={() => email && onEmail?.(email)}
        disabled={!email}
        activeOpacity={0.7}
      >
        <Text style={styles.actionIcon}>{"\u2709"}</Text>
        <Text style={[styles.actionLabel, !email && styles.labelDisabled]}>
          이메일
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={onShare}
        activeOpacity={0.7}
      >
        <Text style={styles.actionIcon}>{"\uD83D\uDD17"}</Text>
        <Text style={styles.actionLabel}>공유</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 4,
  },
  actionDisabled: {
    opacity: 0.4,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
  },
  labelDisabled: {
    color: "#9CA3AF",
  },
});
