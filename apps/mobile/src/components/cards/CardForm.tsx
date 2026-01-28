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

interface ContactEntry {
  id?: string;
  type: "phone" | "email";
  label: string;
  value: string;
  isPrimary: boolean;
}

interface CardFormData {
  name: string;
  company: string;
  jobTitle: string;
  address: string;
  website: string;
  memo: string;
  contactDetails: ContactEntry[];
}

interface CardFormProps {
  initialData?: Partial<CardFormData>;
  isEditing?: boolean;
  onSubmit: (data: CardFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const defaultContact: ContactEntry = {
  type: "phone",
  label: "",
  value: "",
  isPrimary: true,
};

export function CardForm({
  initialData,
  isEditing = false,
  onSubmit,
  onCancel,
  loading = false,
}: CardFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [company, setCompany] = useState(initialData?.company ?? "");
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [website, setWebsite] = useState(initialData?.website ?? "");
  const [memo, setMemo] = useState(initialData?.memo ?? "");
  const [contacts, setContacts] = useState<ContactEntry[]>(
    initialData?.contactDetails?.length
      ? initialData.contactDetails
      : [{ ...defaultContact }]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = "이름을 입력해주세요";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      address: address.trim(),
      website: website.trim(),
      memo: memo.trim(),
      contactDetails: contacts.filter((c) => c.value.trim() !== ""),
    });
  };

  const addContact = (type: "phone" | "email") => {
    setContacts([
      ...contacts,
      { type, label: "", value: "", isPrimary: false },
    ]);
  };

  const updateContact = (index: number, field: keyof ContactEntry, value: any) => {
    const updated = [...contacts];
    (updated[index] as any)[field] = value;
    setContacts(updated);
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
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
        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>이름 *</Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            placeholder="이름"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />
          {errors.name ? (
            <Text style={styles.errorText}>{errors.name}</Text>
          ) : null}
        </View>

        {/* Company */}
        <View style={styles.field}>
          <Text style={styles.label}>회사</Text>
          <TextInput
            style={styles.input}
            placeholder="회사명"
            placeholderTextColor="#9CA3AF"
            value={company}
            onChangeText={setCompany}
          />
        </View>

        {/* Job Title */}
        <View style={styles.field}>
          <Text style={styles.label}>직함</Text>
          <TextInput
            style={styles.input}
            placeholder="직함"
            placeholderTextColor="#9CA3AF"
            value={jobTitle}
            onChangeText={setJobTitle}
          />
        </View>

        {/* Contact Details */}
        <View style={styles.field}>
          <Text style={styles.label}>연락처</Text>
          {contacts.map((contact, index) => (
            <View key={index} style={styles.contactRow}>
              <TouchableOpacity
                style={styles.contactTypeButton}
                onPress={() =>
                  updateContact(
                    index,
                    "type",
                    contact.type === "phone" ? "email" : "phone"
                  )
                }
              >
                <Text style={styles.contactTypeText}>
                  {contact.type === "phone" ? "전화" : "이메일"}
                </Text>
              </TouchableOpacity>
              <TextInput
                style={styles.contactInput}
                placeholder={
                  contact.type === "phone" ? "전화번호" : "이메일 주소"
                }
                placeholderTextColor="#9CA3AF"
                value={contact.value}
                onChangeText={(v) => updateContact(index, "value", v)}
                keyboardType={
                  contact.type === "phone" ? "phone-pad" : "email-address"
                }
                autoCapitalize="none"
              />
              {contacts.length > 1 ? (
                <TouchableOpacity
                  style={styles.removeContactButton}
                  onPress={() => removeContact(index)}
                >
                  <Text style={styles.removeContactText}>{"\u2212"}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
          <View style={styles.addContactRow}>
            <TouchableOpacity
              style={styles.addContactButton}
              onPress={() => addContact("phone")}
            >
              <Text style={styles.addContactText}>+ 전화 추가</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addContactButton}
              onPress={() => addContact("email")}
            >
              <Text style={styles.addContactText}>+ 이메일 추가</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Address */}
        <View style={styles.field}>
          <Text style={styles.label}>주소</Text>
          <TextInput
            style={styles.input}
            placeholder="주소"
            placeholderTextColor="#9CA3AF"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        {/* Website */}
        <View style={styles.field}>
          <Text style={styles.label}>웹사이트</Text>
          <TextInput
            style={styles.input}
            placeholder="https://"
            placeholderTextColor="#9CA3AF"
            value={website}
            onChangeText={setWebsite}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        {/* Memo */}
        <View style={styles.field}>
          <Text style={styles.label}>메모</Text>
          <TextInput
            style={[styles.input, styles.memoInput]}
            placeholder="메모를 입력하세요"
            placeholderTextColor="#9CA3AF"
            value={memo}
            onChangeText={setMemo}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <View style={styles.buttonRow}>
          {onCancel ? (
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[
              styles.submitButton,
              !onCancel && styles.submitButtonFull,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "저장 중..." : isEditing ? "수정 완료" : "저장"}
            </Text>
          </TouchableOpacity>
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
    padding: 16,
    paddingBottom: 40,
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1F2937",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  memoInput: {
    minHeight: 80,
    paddingTop: 10,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  contactTypeButton: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 60,
    alignItems: "center",
  },
  contactTypeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6366F1",
  },
  contactInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1F2937",
  },
  removeContactButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  removeContactText: {
    fontSize: 18,
    color: "#EF4444",
    fontWeight: "600",
  },
  addContactRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  addContactButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  addContactText: {
    fontSize: 13,
    color: "#6366F1",
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#6366F1",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonFull: {
    flex: 1,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
