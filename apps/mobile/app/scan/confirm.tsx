import { useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
import { Image } from "expo-image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scanConfirmSchema, type ScanConfirmInput } from "@cardkeeper/shared-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiUpload } from "../../src/lib/api";

interface OcrParsedResult {
  name: string | null;
  company: string | null;
  jobTitle: string | null;
  contactDetails: Array<{ type: string; value: string }>;
  address: string | null;
  website: string | null;
}

interface ScanUploadResponse {
  data: {
    scanId: string;
    imageUrl: string;
    thumbnailUrl: string;
    ocrResult: {
      rawText: string;
      confidence: number;
      parsed: OcrParsedResult;
    };
  };
}

export default function ScanConfirmScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    imageUri: string;
    source: string;
  }>();

  const [scanResult, setScanResult] = useState<ScanUploadResponse["data"] | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScanConfirmInput>({
    resolver: zodResolver(scanConfirmSchema),
    defaultValues: {
      scanId: "",
      name: "",
      company: "",
      jobTitle: "",
      address: "",
      website: "",
      memo: "",
    },
  });

  useEffect(() => {
    if (params.imageUri) {
      uploadImage(params.imageUri);
    }
  }, [params.imageUri]);

  const uploadImage = async (uri: string) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      const filename = uri.split("/").pop() || "photo.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri,
        name: filename,
        type,
      } as any);
      formData.append(
        "scanMethod",
        params.source === "camera" ? "OCR_CAMERA" : "OCR_GALLERY"
      );

      const response: ScanUploadResponse = await apiUpload(
        "/scan/upload",
        formData
      );

      setScanResult(response.data);

      const parsed = response.data.ocrResult.parsed;
      reset({
        scanId: response.data.scanId,
        name: parsed.name || "",
        company: parsed.company || "",
        jobTitle: parsed.jobTitle || "",
        address: parsed.address || "",
        website: parsed.website || "",
        memo: "",
      });
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "이미지 업로드에 실패했습니다."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const confirmMutation = useMutation({
    mutationFn: async (data: ScanConfirmInput) => {
      const contactDetails: Array<{
        type: "PHONE" | "EMAIL" | "FAX" | "MOBILE" | "OTHER";
        value: string;
        isPrimary: boolean;
      }> = [];

      if (scanResult?.ocrResult.parsed.contactDetails) {
        scanResult.ocrResult.parsed.contactDetails.forEach((c) => {
          contactDetails.push({
            type: c.type as "PHONE" | "EMAIL" | "FAX" | "MOBILE" | "OTHER",
            value: c.value,
            isPrimary: false,
          });
        });
      }

      return apiFetch("/scan/confirm", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          contactDetails:
            contactDetails.length > 0 ? contactDetails : undefined,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      Alert.alert("저장 완료", "명함이 저장되었습니다.", [
        {
          text: "확인",
          onPress: () => router.replace("/(tabs)"),
        },
      ]);
    },
    onError: (err) => {
      Alert.alert(
        "저장 실패",
        err instanceof Error ? err.message : "오류가 발생했습니다."
      );
    },
  });

  const onSubmit = (data: ScanConfirmInput) => {
    confirmMutation.mutate(data);
  };

  const confidencePercent = scanResult
    ? Math.round(scanResult.ocrResult.confidence * 100)
    : 0;

  const getConfidenceColor = (percent: number) => {
    if (percent >= 80) return "#10B981";
    if (percent >= 50) return "#F59E0B";
    return "#EF4444";
  };

  if (isUploading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.uploadingText}>명함을 분석하고 있습니다...</Text>
        <Text style={styles.uploadingSubtext}>잠시만 기다려주세요</Text>
      </View>
    );
  }

  if (uploadError) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.errorIcon}>&#x26A0;</Text>
        <Text style={styles.errorTitle}>분석 실패</Text>
        <Text style={styles.errorMessage}>{uploadError}</Text>
        <View style={styles.errorActions}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => params.imageUri && uploadImage(params.imageUri)}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={confirmMutation.isPending}
              style={styles.saveHeaderButton}
            >
              {confirmMutation.isPending ? (
                <ActivityIndicator size="small" color="#6366F1" />
              ) : (
                <Text style={styles.saveHeaderText}>저장</Text>
              )}
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {params.imageUri ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: params.imageUri }}
                style={styles.previewImage}
                contentFit="contain"
                transition={200}
              />
            </View>
          ) : null}

          {scanResult ? (
            <View style={styles.confidenceBar}>
              <Text style={styles.confidenceLabel}>인식 정확도</Text>
              <View style={styles.confidenceTrack}>
                <View
                  style={[
                    styles.confidenceFill,
                    {
                      width: `${confidencePercent}%`,
                      backgroundColor: getConfidenceColor(confidencePercent),
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.confidenceValue,
                  { color: getConfidenceColor(confidencePercent) },
                ]}
              >
                {confidencePercent}%
              </Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Text style={styles.formTitle}>인식된 정보를 확인하세요</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                이름 <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    placeholder="이름"
                    placeholderTextColor="#9CA3AF"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name.message}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>회사</Text>
              <Controller
                control={control}
                name="company"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="회사명"
                    placeholderTextColor="#9CA3AF"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value || ""}
                  />
                )}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>직함</Text>
              <Controller
                control={control}
                name="jobTitle"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="직함"
                    placeholderTextColor="#9CA3AF"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value || ""}
                  />
                )}
              />
            </View>

            {scanResult?.ocrResult.parsed.contactDetails &&
            scanResult.ocrResult.parsed.contactDetails.length > 0 ? (
              <View style={styles.detectedContacts}>
                <Text style={styles.detectedTitle}>감지된 연락처</Text>
                {scanResult.ocrResult.parsed.contactDetails.map(
                  (contact, index) => (
                    <View key={index} style={styles.detectedContactItem}>
                      <Text style={styles.detectedContactType}>
                        {contact.type === "PHONE"
                          ? "전화"
                          : contact.type === "EMAIL"
                          ? "이메일"
                          : contact.type === "MOBILE"
                          ? "휴대폰"
                          : contact.type === "FAX"
                          ? "팩스"
                          : "기타"}
                      </Text>
                      <Text style={styles.detectedContactValue}>
                        {contact.value}
                      </Text>
                    </View>
                  )
                )}
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>주소</Text>
              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="주소"
                    placeholderTextColor="#9CA3AF"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value || ""}
                    multiline
                    numberOfLines={2}
                  />
                )}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>웹사이트</Text>
              <Controller
                control={control}
                name="website"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.website && styles.inputError]}
                    placeholder="https://example.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="url"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value || ""}
                  />
                )}
              />
              {errors.website ? (
                <Text style={styles.errorText}>{errors.website.message}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>메모</Text>
              <Controller
                control={control}
                name="memo"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.memoInput]}
                    placeholder="메모"
                    placeholderTextColor="#9CA3AF"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value || ""}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                )}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              confirmMutation.isPending && styles.saveButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={confirmMutation.isPending}
            activeOpacity={0.8}
          >
            {confirmMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>명함 저장</Text>
            )}
          </TouchableOpacity>
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
    paddingBottom: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F9FAFB",
  },
  uploadingText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 20,
  },
  uploadingSubtext: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  errorActions: {
    flexDirection: "row",
    gap: 12,
  },
  retryButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "600",
  },
  imageContainer: {
    backgroundColor: "#1F2937",
    paddingVertical: 8,
  },
  previewImage: {
    width: "100%",
    height: 200,
  },
  confidenceBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    gap: 10,
  },
  confidenceLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  confidenceTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  confidenceFill: {
    height: "100%",
    borderRadius: 3,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: "700",
    minWidth: 40,
    textAlign: "right",
  },
  form: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    gap: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  required: {
    color: "#EF4444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  memoInput: {
    minHeight: 80,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
  },
  detectedContacts: {
    backgroundColor: "#EEF2FF",
    borderRadius: 10,
    padding: 14,
    gap: 8,
  },
  detectedTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6366F1",
    marginBottom: 4,
  },
  detectedContactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detectedContactType: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4F46E5",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  detectedContactValue: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  saveButton: {
    backgroundColor: "#6366F1",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginHorizontal: 16,
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
  saveHeaderButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  saveHeaderText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6366F1",
  },
});
