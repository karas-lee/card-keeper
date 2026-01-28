import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ExportFormat = "csv" | "vcf" | "json";

interface ExportWizardProps {
  onExport: (format: ExportFormat) => void;
  onCancel?: () => void;
  loading?: boolean;
  totalCards?: number;
}

interface StepProps {
  step: number;
  title: string;
  isActive: boolean;
  isComplete: boolean;
}

function StepIndicator({ step, title, isActive, isComplete }: StepProps) {
  return (
    <View style={stepStyles.container}>
      <View
        style={[
          stepStyles.circle,
          isActive && stepStyles.circleActive,
          isComplete && stepStyles.circleComplete,
        ]}
      >
        <Text
          style={[
            stepStyles.circleText,
            (isActive || isComplete) && stepStyles.circleTextActive,
          ]}
        >
          {isComplete ? "\u2713" : step}
        </Text>
      </View>
      <Text
        style={[stepStyles.title, isActive && stepStyles.titleActive]}
      >
        {title}
      </Text>
    </View>
  );
}

const stepStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  circleActive: {
    backgroundColor: "#6366F1",
  },
  circleComplete: {
    backgroundColor: "#10B981",
  },
  circleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  circleTextActive: {
    color: "#FFFFFF",
  },
  title: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  titleActive: {
    color: "#1F2937",
    fontWeight: "600",
  },
});

const STEPS = ["형식 선택", "확인", "완료"];

const FORMAT_OPTIONS: { key: ExportFormat; label: string; description: string; icon: string }[] = [
  {
    key: "csv",
    label: "CSV",
    description: "스프레드시트 호환 (Excel, Google Sheets)",
    icon: "\uD83D\uDCC4",
  },
  {
    key: "vcf",
    label: "VCF (vCard)",
    description: "연락처 앱 호환 (iOS, Android)",
    icon: "\uD83D\uDC64",
  },
  {
    key: "json",
    label: "JSON",
    description: "개발용 데이터 포맷",
    icon: "\uD83D\uDCBE",
  },
];

export function ExportWizard({
  onExport,
  onCancel,
  loading = false,
  totalCards = 0,
}: ExportWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);

  const handleNext = () => {
    if (currentStep === 0 && selectedFormat) {
      setCurrentStep(1);
    } else if (currentStep === 1 && selectedFormat) {
      setCurrentStep(2);
      onExport(selectedFormat);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Step Indicators */}
      <View style={styles.stepsRow}>
        {STEPS.map((title, index) => (
          <React.Fragment key={title}>
            <StepIndicator
              step={index + 1}
              title={title}
              isActive={currentStep === index}
              isComplete={currentStep > index}
            />
            {index < STEPS.length - 1 ? (
              <View
                style={[
                  styles.stepLine,
                  currentStep > index && styles.stepLineComplete,
                ]}
              />
            ) : null}
          </React.Fragment>
        ))}
      </View>

      {/* Step Content */}
      <View style={styles.content}>
        {currentStep === 0 ? (
          <View>
            <Text style={styles.stepTitle}>내보내기 형식을 선택하세요</Text>
            <Text style={styles.stepSubtitle}>
              {totalCards}개의 명함을 내보냅니다
            </Text>
            {FORMAT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.formatOption,
                  selectedFormat === option.key && styles.formatOptionSelected,
                ]}
                onPress={() => setSelectedFormat(option.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.formatIcon}>{option.icon}</Text>
                <View style={styles.formatInfo}>
                  <Text style={styles.formatLabel}>{option.label}</Text>
                  <Text style={styles.formatDescription}>
                    {option.description}
                  </Text>
                </View>
                {selectedFormat === option.key ? (
                  <View style={styles.radioSelected}>
                    <View style={styles.radioInner} />
                  </View>
                ) : (
                  <View style={styles.radio} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : currentStep === 1 ? (
          <View style={styles.confirmContent}>
            <Text style={styles.stepTitle}>내보내기 확인</Text>
            <View style={styles.confirmCard}>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>형식</Text>
                <Text style={styles.confirmValue}>
                  {FORMAT_OPTIONS.find((f) => f.key === selectedFormat)?.label}
                </Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>명함 수</Text>
                <Text style={styles.confirmValue}>{totalCards}개</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.completeContent}>
            {loading ? (
              <>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>내보내기 진행 중...</Text>
              </>
            ) : (
              <>
                <View style={styles.successIcon}>
                  <Text style={styles.successIconText}>{"\u2713"}</Text>
                </View>
                <Text style={styles.successTitle}>내보내기 완료!</Text>
                <Text style={styles.successDescription}>
                  파일이 성공적으로 생성되었습니다.
                </Text>
              </>
            )}
          </View>
        )}
      </View>

      {/* Bottom Actions */}
      <View style={styles.actions}>
        {currentStep > 0 && currentStep < 2 ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>이전</Text>
          </TouchableOpacity>
        ) : onCancel && currentStep === 0 ? (
          <TouchableOpacity style={styles.backButton} onPress={onCancel}>
            <Text style={styles.backButtonText}>취소</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}

        {currentStep < 2 ? (
          <TouchableOpacity
            style={[
              styles.nextButton,
              !selectedFormat && styles.buttonDisabled,
            ]}
            onPress={handleNext}
            disabled={!selectedFormat}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === 1 ? "내보내기" : "다음"}
            </Text>
          </TouchableOpacity>
        ) : !loading ? (
          <TouchableOpacity style={styles.nextButton} onPress={onCancel}>
            <Text style={styles.nextButtonText}>완료</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  stepLine: {
    height: 2,
    flex: 1,
    backgroundColor: "#E5E7EB",
    marginTop: 16,
  },
  stepLineComplete: {
    backgroundColor: "#10B981",
  },
  content: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
  },
  formatOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  formatOptionSelected: {
    borderColor: "#6366F1",
    backgroundColor: "#F5F3FF",
  },
  formatIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  formatInfo: {
    flex: 1,
  },
  formatLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  formatDescription: {
    fontSize: 12,
    color: "#6B7280",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },
  radioSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#6366F1",
  },
  confirmContent: {},
  confirmCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  confirmRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F3F4F6",
  },
  confirmLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  confirmValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  completeContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 16,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successIconText: {
    fontSize: 30,
    color: "#10B981",
    fontWeight: "700",
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  successDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
  },
  backButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  nextButton: {
    flex: 1,
    backgroundColor: "#6366F1",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  spacer: {
    flex: 1,
  },
});
