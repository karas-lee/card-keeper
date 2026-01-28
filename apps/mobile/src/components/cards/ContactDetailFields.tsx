import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface ContactDetailItem {
  id: string;
  type: string;
  label: string | null;
  value: string;
  isPrimary: boolean;
}

interface ContactDetailFieldsProps {
  items: ContactDetailItem[];
  onPhonePress?: (phone: string) => void;
  onEmailPress?: (email: string) => void;
}

const typeIcons: Record<string, string> = {
  phone: "\uD83D\uDCDE",
  email: "\u2709\uFE0F",
  fax: "\uD83D\uDCE0",
  mobile: "\uD83D\uDCF1",
};

const typeLabels: Record<string, string> = {
  phone: "전화",
  email: "이메일",
  fax: "팩스",
  mobile: "휴대폰",
};

export function ContactDetailFields({
  items,
  onPhonePress,
  onEmailPress,
}: ContactDetailFieldsProps) {
  const handlePress = (item: ContactDetailItem) => {
    if (item.type === "phone" || item.type === "mobile") {
      onPhonePress?.(item.value);
    } else if (item.type === "email") {
      onEmailPress?.(item.value);
    }
  };

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={item.id || index}
          style={[
            styles.row,
            index < items.length - 1 && styles.rowBorder,
          ]}
          onPress={() => handlePress(item)}
          activeOpacity={0.6}
        >
          <Text style={styles.icon}>
            {typeIcons[item.type] || "\uD83D\uDCCB"}
          </Text>
          <View style={styles.info}>
            <Text style={styles.typeLabel}>
              {item.label || typeLabels[item.type] || item.type}
              {item.isPrimary ? " (기본)" : ""}
            </Text>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F3F4F6",
  },
  icon: {
    fontSize: 18,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
});
