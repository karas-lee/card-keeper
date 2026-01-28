import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

interface BottomSheetWrapperProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  snapPoint?: "25%" | "50%" | "75%" | "90%";
  children: React.ReactNode;
  showHandle?: boolean;
  showCloseButton?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  scrollable?: boolean;
}

const snapPointToHeight: Record<string, string> = {
  "25%": "25%",
  "50%": "50%",
  "75%": "75%",
  "90%": "90%",
};

export function BottomSheetWrapper({
  visible,
  onClose,
  title,
  snapPoint = "50%",
  children,
  showHandle = true,
  showCloseButton = true,
  contentStyle,
  scrollable = true,
}: BottomSheetWrapperProps) {
  const ContentWrapper = scrollable ? ScrollView : View;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.overlay} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { maxHeight: snapPointToHeight[snapPoint] },
          ]}
        >
          {showHandle ? <View style={styles.handle} /> : null}

          {title || showCloseButton ? (
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={1}>
                {title || ""}
              </Text>
              {showCloseButton ? (
                <TouchableOpacity onPress={onClose}>
                  <Text style={styles.closeText}>닫기</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          <ContentWrapper
            style={[styles.content, contentStyle]}
            {...(scrollable
              ? {
                  showsVerticalScrollIndicator: false,
                  keyboardShouldPersistTaps: "handled" as const,
                }
              : {})}
          >
            {children}
          </ContentWrapper>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    flex: 1,
  },
  closeText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginLeft: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});
