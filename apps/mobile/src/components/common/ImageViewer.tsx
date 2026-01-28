import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ImageViewerProps {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export function ImageViewer({
  visible,
  imageUrl,
  onClose,
}: ImageViewerProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newX = lastTranslateX.current + gestureState.dx;
        const newY = lastTranslateY.current + gestureState.dy;
        translateX.setValue(newX);
        translateY.setValue(newY);
      },
      onPanResponderRelease: (_, gestureState) => {
        lastTranslateX.current += gestureState.dx;
        lastTranslateY.current += gestureState.dy;

        // Snap back if dragged too far vertically (dismiss gesture)
        if (Math.abs(lastTranslateY.current) > 150) {
          onClose();
          resetTransforms();
        }
      },
    })
  ).current;

  const resetTransforms = () => {
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
    lastScale.current = 1;
    lastTranslateX.current = 0;
    lastTranslateY.current = 0;
  };

  const handleDoubleTap = (() => {
    let lastTap = 0;
    return () => {
      const now = Date.now();
      if (now - lastTap < 300) {
        // Double tap detected
        if (lastScale.current > 1) {
          // Zoom out
          Animated.parallel([
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: true,
            }),
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }),
          ]).start();
          lastScale.current = 1;
          lastTranslateX.current = 0;
          lastTranslateY.current = 0;
        } else {
          // Zoom in
          Animated.spring(scale, {
            toValue: 2,
            useNativeDriver: true,
          }).start();
          lastScale.current = 2;
        }
      }
      lastTap = now;
    };
  })();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>{"\u2715"}</Text>
          </TouchableOpacity>
        </View>

        {/* Image */}
        <Animated.View
          style={[
            styles.imageContainer,
            {
              transform: [
                { translateX },
                { translateY },
                { scale },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity activeOpacity={1} onPress={handleDoubleTap}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Hint */}
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            더블 탭하여 확대 / 위아래로 드래그하여 닫기
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 56,
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  hint: {
    position: "absolute",
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  hintText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
});
