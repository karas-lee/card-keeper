import { useRef, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewToken,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SlideData {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const SLIDES: SlideData[] = [
  {
    id: "1",
    icon: "\uD83D\uDCF7",
    title: "\uBA85\uD568\uC744 \uC2A4\uCE94\uD558\uC138\uC694",
    description:
      "\uCE74\uBA54\uB77C\uB85C \uBA85\uD568\uC744 \uC2A4\uCE94\uD558\uBA74\n\uC790\uB3D9\uC73C\uB85C \uC815\uBCF4\uAC00 \uC785\uB825\uB429\uB2C8\uB2E4.",
  },
  {
    id: "2",
    icon: "\uD83D\uDCC1",
    title: "\uAE54\uB054\uD558\uAC8C \uC815\uB9AC\uD558\uC138\uC694",
    description:
      "\uD3F4\uB354\uC640 \uD0DC\uADF8\uB85C \uBA85\uD568\uC744\n\uCCB4\uACC4\uC801\uC73C\uB85C \uAD00\uB9AC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  },
  {
    id: "3",
    icon: "\uD83C\uDF10",
    title: "\uC5B4\uB514\uC11C\uB098 \uD655\uC778\uD558\uC138\uC694",
    description:
      "\uD074\uB77C\uC6B0\uB4DC \uB3D9\uAE30\uD654\uB85C \uC5B8\uC81C \uC5B4\uB514\uC11C\uB098\n\uBA85\uD568 \uC815\uBCF4\uB97C \uD655\uC778\uD558\uC138\uC694.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList<SlideData>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const handleSkip = () => {
    router.replace("/(auth)/login");
  };

  const handleStart = () => {
    router.replace("/(auth)/login");
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const renderSlide = ({ item }: { item: SlideData }) => (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>
        <Text style={styles.slideIcon}>{item.icon}</Text>
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDescription}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>{"\uAC74\uB108\uB6F0\uAE30"}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      <View style={styles.bottomSection}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {isLastSlide ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>
              {"\uC2DC\uC791\uD558\uAE30"}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.startButtonPlaceholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  skipContainer: {
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 12,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  slide: {
    width: SCREEN_WIDTH,
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
    marginBottom: 40,
  },
  slideIcon: {
    fontSize: 56,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 60,
    alignItems: "center",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: "#6366F1",
    width: 24,
  },
  dotInactive: {
    backgroundColor: "#D1D5DB",
  },
  startButton: {
    backgroundColor: "#6366F1",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 48,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 50,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  startButtonPlaceholder: {
    height: 50,
  },
});
