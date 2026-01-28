import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

interface OnboardingSlide {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface OnboardingSlidesProps {
  slides?: OnboardingSlide[];
  onComplete: () => void;
  onSkip?: () => void;
}

const DEFAULT_SLIDES: OnboardingSlide[] = [
  {
    id: "1",
    icon: "\uD83D\uDCC7",
    title: "명함을 스캔하세요",
    description:
      "카메라로 명함을 촬영하면\nOCR 기술로 자동으로 정보를 인식합니다.",
  },
  {
    id: "2",
    icon: "\uD83D\uDCC2",
    title: "폴더와 태그로 정리",
    description:
      "명함을 폴더별로 분류하고\n태그를 달아 쉽게 관리하세요.",
  },
  {
    id: "3",
    icon: "\uD83D\uDD0D",
    title: "빠르게 검색",
    description:
      "이름, 회사, 직함으로\n원하는 명함을 빠르게 찾으세요.",
  },
  {
    id: "4",
    icon: "\uD83D\uDE80",
    title: "시작할 준비가 되셨나요?",
    description:
      "CardKeeper와 함께\n명함 관리를 시작해보세요!",
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function OnboardingSlides({
  slides = DEFAULT_SLIDES,
  onComplete,
  onSkip,
}: OnboardingSlidesProps) {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isLastSlide = currentIndex === slides.length - 1;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x;
    const index = Math.round(offset / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Skip button */}
      {!isLastSlide && onSkip ? (
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>건너뛰기</Text>
        </TouchableOpacity>
      ) : null}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={styles.iconContainer}>
              <Text style={styles.slideIcon}>{item.icon}</Text>
            </View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideDescription}>{item.description}</Text>
          </View>
        )}
      />

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        {/* Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Next/Start button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {isLastSlide ? "시작하기" : "다음"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  skipButton: {
    position: "absolute",
    top: 56,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  slideIcon: {
    fontSize: 56,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 12,
  },
  slideDescription: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  bottomControls: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    height: 8,
    backgroundColor: "#6366F1",
  },
  dotInactive: {
    width: 8,
    height: 8,
    backgroundColor: "#D1D5DB",
  },
  nextButton: {
    backgroundColor: "#6366F1",
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
