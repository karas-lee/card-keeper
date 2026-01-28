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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCardSchema, type CreateCardInput } from "@cardkeeper/shared-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../src/lib/api";

export default function NewCardScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    editId?: string;
    prefillName?: string;
    prefillCompany?: string;
    prefillJobTitle?: string;
    prefillPhone?: string;
    prefillEmail?: string;
    prefillAddress?: string;
    prefillWebsite?: string;
  }>();

  const isEditing = !!params.editId;

  const { data: existingCard } = useQuery<{ data: any }>({
    queryKey: ["cards", params.editId],
    queryFn: () => apiFetch(`/cards/${params.editId}`),
    enabled: isEditing,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCardInput>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      name: params.prefillName || "",
      company: params.prefillCompany || "",
      jobTitle: params.prefillJobTitle || "",
      address: params.prefillAddress || "",
      website: params.prefillWebsite || "",
      memo: "",
    },
  });

  useEffect(() => {
    if (existingCard?.data) {
      const c = existingCard.data;
      reset({
        name: c.name || "",
        company: c.company || "",
        jobTitle: c.jobTitle || "",
        address: c.address || "",
        website: c.website || "",
        memo: c.memo || "",
        folderId: c.folderId,
        tagIds: c.tags?.map((t: any) => t.id),
      });
    }
  }, [existingCard, reset]);

  const createMutation = useMutation({
    mutationFn: async (data: CreateCardInput) => {
      if (isEditing) {
        return apiFetch(`/cards/${params.editId}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
      }

      const contactDetails: Array<{
        type: "PHONE" | "EMAIL" | "FAX" | "MOBILE" | "OTHER";
        value: string;
        isPrimary: boolean;
      }> = [];

      if (params.prefillPhone) {
        contactDetails.push({
          type: "MOBILE",
          value: params.prefillPhone,
          isPrimary: true,
        });
      }
      if (params.prefillEmail) {
        contactDetails.push({
          type: "EMAIL",
          value: params.prefillEmail,
          isPrimary: true,
        });
      }

      return apiFetch("/cards", {
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
      router.back();
    },
    onError: (err) => {
      Alert.alert(
        isEditing ? "수정 실패" : "저장 실패",
        err instanceof Error ? err.message : "오류가 발생했습니다."
      );
    },
  });

  const onSubmit = (data: CreateCardInput) => {
    createMutation.mutate(data);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditing ? "명함 수정" : "명함 추가",
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={createMutation.isPending}
              style={styles.saveHeaderButton}
            >
              {createMutation.isPending ? (
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
          <View style={styles.form}>
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
                    placeholder="이름을 입력하세요"
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
                    placeholder="회사명을 입력하세요"
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
                    placeholder="직함을 입력하세요"
                    placeholderTextColor="#9CA3AF"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value || ""}
                  />
                )}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>주소</Text>
              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="주소를 입력하세요"
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

            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>메모</Text>
              <Controller
                control={control}
                name="memo"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.memoInput]}
                    placeholder="메모를 입력하세요"
                    placeholderTextColor="#9CA3AF"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value || ""}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                )}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              createMutation.isPending && styles.saveButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={createMutation.isPending}
            activeOpacity={0.8}
          >
            {createMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditing ? "수정하기" : "저장하기"}
              </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    gap: 16,
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
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
  },
  saveButton: {
    backgroundColor: "#6366F1",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
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
