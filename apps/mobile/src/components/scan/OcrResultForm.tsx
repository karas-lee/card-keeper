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

interface OcrField {
  key: string;
  label: string;
  value: string;
  confidence?: number;
}

interface OcrResultFormProps {
  imageUri?: string;
  fields: OcrField[];
  onSave: (data: Record<string, string>) => void;
  onRetake?: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function OcrResultForm({
  imageUri,
  fields: initialFields,
  onSave,
  onRetake,
  onCancel,
  loading = false,
}: OcrResultFormProps) {
  const [fields, setFields] = useState<OcrField[]>(initialFields);

  const updateField = (key: string, value: string) => {
    setFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, value } : f))
    );
  };

  const handleSave = () => {
    const data: Record<string, string> = {};
    fields.forEach((f) => {
      data[f.key] = f.value;
    });
    onSave(data);
  };

  const getConfidenceColor = (confidence?: number): string => {
    if (confidence === undefined) return "#9CA3AF";
    if (confidence >= 0.8) return "#10B981";
    if (confidence >= 0.5) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Scanned Image Preview */}
        {imageUri ? (
          <View style={styles.imageSection}>
            <Image
              source={{ uri: imageUri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>
        ) : null}

        {/* OCR Results */}
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>인식 결과</Text>
          <Text style={styles.sectionDescription}>
            인식된 정보를 확인하고 필요하면 수정해주세요.
          </Text>

          {fields.map((field) => (
            <View key={field.key} style={styles.field}>
              <View style={styles.fieldHeader}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                {field.confidence !== undefined ? (
                  <Text
                    style={[
                      styles.confidenceText,
                      { color: getConfidenceColor(field.confidence) },
                    ]}
                  >
                    {Math.round(field.confidence * 100)}%
                  </Text>
                ) : null}
              </View>
              <TextInput
                style={styles.input}
                value={field.value}
                onChangeText={(v) => updateField(field.key, v)}
                placeholderTextColor="#9CA3AF"
                placeholder={`${field.label}을(를) 입력하세요`}
              />
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "저장 중..." : "저장하기"}
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            {onRetake ? (
              <TouchableOpacity style={styles.secondaryButton} onPress={onRetake}>
                <Text style={styles.secondaryButtonText}>다시 촬영</Text>
              </TouchableOpacity>
            ) : null}
            {onCancel ? (
              <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
                <Text style={styles.secondaryButtonText}>취소</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  imageSection: {
    backgroundColor: "#1F2937",
    padding: 16,
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
  },
  resultsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 20,
  },
  field: {
    marginBottom: 14,
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1F2937",
  },
  actions: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  saveButton: {
    backgroundColor: "#6366F1",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 12,
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "500",
  },
});
