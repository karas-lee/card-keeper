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
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCardSchema,
  type CreateCardInput,
  type ContactDetailInput,
} from "@cardkeeper/shared-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../../src/lib/api";

const CONTACT_TYPES = [
  { value: "PHONE", label: "전화" },
  { value: "EMAIL", label: "이메일" },
  { value: "FAX", label: "팩스" },
  { value: "MOBILE", label: "휴대폰" },
  { value: "OTHER", label: "기타" },
] as const;

type ContactType = "PHONE" | "EMAIL" | "FAX" | "MOBILE" | "OTHER";

interface ContactDetail {
  id: string;
  cardId: string;
  type: string;
  label: string | null;
  value: string;
  isPrimary: boolean;
}

interface CardDetail {
  id: string;
  name: string;
  company: string | null;
  jobTitle: string | null;
  department: string | null;
  address: string | null;
  website: string | null;
  memo: string | null;
  folderId: string | null;
  tags: { id: string; name: string; color: string | null }[];
  contactDetails: ContactDetail[];
}

interface FormValues extends CreateCardInput {
  contactDetails?: Array<{
    type: ContactType;
    label?: string;
    value: string;
    isPrimary: boolean;
  }>;
}

function getKeyboardType(type: ContactType) {
  switch (type) {
    case "PHONE":
    case "MOBILE":
    case "FAX":
      return "phone-pad" as const;
    case "EMAIL":
      return "email-address" as const;
    default:
      return "default" as const;
  }
}

function getPlaceholder(type: ContactType) {
  switch (type) {
    case "PHONE":
      return "전화번호를 입력하세요";
    case "MOBILE":
      return "휴대폰 번호를 입력하세요";
    case "EMAIL":
      return "이메일을 입력하세요";
    case "FAX":
      return "팩스 번호를 입력하세요";
    default:
      return "값을 입력하세요";
  }
}

export default function EditCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedTypes, setSelectedTypes] = useState<ContactType[]>([]);

  const {
    data: existingCard,
    isLoading: isFetching,
    isError: isFetchError,
    error: fetchError,
  } = useQuery<{ data: CardDetail }>({
    queryKey: ["cards", id],
    queryFn: () => apiFetch(`/cards/${id}`),
    enabled: !!id,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      name: "",
      company: "",
      jobTitle: "",
      address: "",
      website: "",
      memo: "",
      contactDetails: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contactDetails",
  });

  useEffect(() => {
    if (existingCard?.data) {
      const c = existingCard.data;
      const contacts = c.contactDetails.map((cd) => ({
        type: cd.type as ContactType,
        label: cd.label || undefined,
        value: cd.value,
        isPrimary: cd.isPrimary,
      }));

      reset({
        name: c.name || "",
        company: c.company || "",
        jobTitle: c.jobTitle || "",
        address: c.address || "",
        website: c.website || "",
        memo: c.memo || "",
        folderId: c.folderId,
        tagIds: c.tags?.map((t) => t.id),
        contactDetails: contacts,
      });

      setSelectedTypes(contacts.map((cd) => cd.type));
    }
  }, [existingCard, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      return apiFetch(`/cards/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["cards", id] });
      router.back();
    },
    onError: (err) => {
      Alert.alert(
        "수정 실패",
        err instanceof Error ? err.message : "오류가 발생했습니다."
      );
    },
  });

  const onSubmit = (data: FormValues) => {
    updateMutation.mutate(data);
  };

  const handleAddContact = () => {
    append({
      type: "PHONE",
      value: "",
      isPrimary: false,
    });
    setSelectedTypes((prev) => [...prev, "PHONE"]);
  };

  const handleRemoveContact = (index: number) => {
    remove(index);
    setSelectedTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTypeChange = (index: number, type: ContactType) => {
    setSelectedTypes((prev) => {
      const next = [...prev];
      next[index] = type;
      return next;
    });
  };

  if (isFetching) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>명함 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (isFetchError || !existingCard?.data) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.fetchErrorText}>
          {fetchError instanceof Error
            ? fetchError.message
            : "명함을 불러올 수 없습니다"}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "명함 수정",
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={updateMutation.isPending}
              style={styles.saveHeaderButton}
            >
              {updateMutation.isPending ? (
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

            {/* Contact Details Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>연락처</Text>
              <TouchableOpacity
                onPress={handleAddContact}
                style={styles.addButton}
                activeOpacity={0.7}
              >
                <Text style={styles.addButtonText}>+ 추가</Text>
              </TouchableOpacity>
            </View>

            {fields.map((field, index) => (
              <View key={field.id} style={styles.contactRow}>
                <View style={styles.contactTypeRow}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.typeChipsContainer}
                  >
                    {CONTACT_TYPES.map((ct) => (
                      <Controller
                        key={ct.value}
                        control={control}
                        name={`contactDetails.${index}.type`}
                        render={({ field: { onChange, value } }) => (
                          <TouchableOpacity
                            style={[
                              styles.typeChip,
                              value === ct.value && styles.typeChipSelected,
                            ]}
                            onPress={() => {
                              onChange(ct.value);
                              handleTypeChange(index, ct.value);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.typeChipText,
                                value === ct.value &&
                                  styles.typeChipTextSelected,
                              ]}
                            >
                              {ct.label}
                            </Text>
                          </TouchableOpacity>
                        )}
                      />
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    onPress={() => handleRemoveContact(index)}
                    style={styles.removeButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.removeButtonText}>삭제</Text>
                  </TouchableOpacity>
                </View>
                <Controller
                  control={control}
                  name={`contactDetails.${index}.value`}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        errors.contactDetails?.[index]?.value &&
                          styles.inputError,
                      ]}
                      placeholder={getPlaceholder(
                        selectedTypes[index] || "PHONE"
                      )}
                      placeholderTextColor="#9CA3AF"
                      keyboardType={getKeyboardType(
                        selectedTypes[index] || "PHONE"
                      )}
                      autoCapitalize="none"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.contactDetails?.[index]?.value ? (
                  <Text style={styles.errorText}>
                    {errors.contactDetails[index]?.value?.message}
                  </Text>
                ) : null}
              </View>
            ))}

            {fields.length === 0 ? (
              <Text style={styles.emptyContactText}>
                등록된 연락처가 없습니다. 추가 버튼을 눌러 연락처를 등록하세요.
              </Text>
            ) : null}

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
              updateMutation.isPending && styles.saveButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={updateMutation.isPending}
            activeOpacity={0.8}
          >
            {updateMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>수정하기</Text>
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
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 12,
  },
  fetchErrorText: {
    fontSize: 15,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6366F1",
  },
  contactRow: {
    gap: 8,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  contactTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  typeChipsContainer: {
    flexDirection: "row",
    gap: 6,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  typeChipSelected: {
    backgroundColor: "#EEF2FF",
    borderColor: "#6366F1",
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  typeChipTextSelected: {
    color: "#6366F1",
    fontWeight: "600",
  },
  removeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#EF4444",
  },
  emptyContactText: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 12,
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
