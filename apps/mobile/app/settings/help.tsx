import { useState } from "react";
import { Stack } from "expo-router";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "1",
    question: "명함을 어떻게 스캔하나요?",
    answer:
      "하단 탭에서 '스캔' 버튼을 눌러 카메라를 실행한 후, 명함을 화면에 맞춰 촬영하세요. OCR 기술이 자동으로 명함 정보를 인식합니다.",
  },
  {
    id: "2",
    question: "스캔한 명함 정보를 수정할 수 있나요?",
    answer:
      "네, 스캔 후 확인 화면에서 인식된 정보를 수정할 수 있습니다. 또한 저장된 명함의 상세 화면에서 '편집' 버튼을 눌러 언제든지 수정할 수 있습니다.",
  },
  {
    id: "3",
    question: "명함을 폴더로 분류할 수 있나요?",
    answer:
      "네, 폴더를 만들어 명함을 체계적으로 분류할 수 있습니다. '폴더' 탭에서 새 폴더를 만들고, 명함을 원하는 폴더에 배치하세요.",
  },
  {
    id: "4",
    question: "태그는 어떻게 사용하나요?",
    answer:
      "태그를 사용하면 폴더와 별개로 명함에 키워드를 부여할 수 있습니다. 예를 들어 '거래처', '컨퍼런스' 등의 태그를 만들어 명함을 분류하세요.",
  },
  {
    id: "5",
    question: "데이터를 백업하거나 내보낼 수 있나요?",
    answer:
      "설정 > 데이터 내보내기에서 CSV 또는 vCard 형식으로 명함 데이터를 내보낼 수 있습니다. 클라우드 동기화를 통해 데이터가 자동으로 백업됩니다.",
  },
  {
    id: "6",
    question: "다른 기기에서도 명함을 확인할 수 있나요?",
    answer:
      "네, 같은 계정으로 로그인하면 클라우드 동기화를 통해 모든 기기에서 명함 데이터를 확인할 수 있습니다.",
  },
];

export default function HelpScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleContactSupport = () => {
    Linking.openURL("mailto:support@cardkeeper.app");
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "도움말",
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.appInfoSection}>
          <View style={styles.appIconContainer}>
            <Text style={styles.appIcon}>{"\uD83D\uDCCB"}</Text>
          </View>
          <Text style={styles.appName}>CardKeeper</Text>
          <Text style={styles.appVersion}>v0.1.0</Text>
          <Text style={styles.appDescription}>
            비즈니스 명함 관리 서비스
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>자주 묻는 질문</Text>
          <View style={styles.faqCard}>
            {FAQ_ITEMS.map((item, index) => (
              <View key={item.id}>
                {index > 0 ? <View style={styles.faqSeparator} /> : null}
                <TouchableOpacity
                  style={styles.faqItem}
                  onPress={() => toggleExpand(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqQuestion}>
                    <Text style={styles.faqQuestionText} numberOfLines={2}>
                      {item.question}
                    </Text>
                    <Text style={styles.faqChevron}>
                      {expandedId === item.id ? "\u2303" : "\u2304"}
                    </Text>
                  </View>
                  {expandedId === item.id ? (
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                  ) : null}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>문의하기</Text>
          <View style={styles.contactCard}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={handleContactSupport}
              activeOpacity={0.7}
            >
              <Text style={styles.contactIcon}>{"\u2709"}</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>이메일 문의</Text>
                <Text style={styles.contactValue}>
                  support@cardkeeper.app
                </Text>
              </View>
              <Text style={styles.contactChevron}>{"\u203A"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.copyright}>
          {"\u00A9"} 2024 CardKeeper. All rights reserved.
        </Text>
      </ScrollView>
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
  appInfoSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  appIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  appIcon: {
    fontSize: 36,
  },
  appName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#6366F1",
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  appDescription: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  faqCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  faqSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
  },
  faqItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginRight: 12,
  },
  faqChevron: {
    fontSize: 18,
    color: "#6B7280",
    fontWeight: "600",
  },
  faqAnswer: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
    marginTop: 10,
    paddingRight: 30,
  },
  contactCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  contactIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    color: "#6366F1",
    fontWeight: "500",
  },
  contactChevron: {
    fontSize: 22,
    color: "#D1D5DB",
    fontWeight: "300",
  },
  copyright: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 32,
  },
});
