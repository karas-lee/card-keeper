import { useRef, useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";

export default function ScanScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "카메라 권한 필요",
          "명함을 스캔하려면 카메라 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요."
        );
        return;
      }
    }
    setShowCamera(true);
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      if (photo?.uri) {
        setShowCamera(false);
        router.push({
          pathname: "/scan/confirm",
          params: { imageUri: photo.uri, source: "camera" },
        });
      }
    } catch (error) {
      Alert.alert("촬영 실패", "사진 촬영 중 오류가 발생했습니다.");
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        router.push({
          pathname: "/scan/confirm",
          params: { imageUri: result.assets[0].uri, source: "gallery" },
        });
      }
    } catch (error) {
      Alert.alert("이미지 선택 실패", "갤러리에서 이미지를 가져오는 중 오류가 발생했습니다.");
    }
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.frameGuide}>
              <View style={[styles.cornerTL, styles.corner]} />
              <View style={[styles.cornerTR, styles.corner]} />
              <View style={[styles.cornerBL, styles.corner]} />
              <View style={[styles.cornerBR, styles.corner]} />
            </View>
            <Text style={styles.guideText}>
              명함을 프레임 안에 맞춰주세요
            </Text>
          </View>

          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.captureButton,
                isCapturing && styles.captureButtonDisabled,
              ]}
              onPress={handleCapture}
              disabled={isCapturing}
              activeOpacity={0.7}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <View style={styles.placeholder} />
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.mainIcon}>&#x1F4F7;</Text>
        </View>
        <Text style={styles.title}>명함 스캔</Text>
        <Text style={styles.description}>
          카메라로 명함을 촬영하거나 갤러리에서 이미지를 선택하세요.{"\n"}
          OCR 기술로 명함 정보를 자동으로 인식합니다.
        </Text>

        <View style={styles.optionButtons}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleOpenCamera}
            activeOpacity={0.8}
          >
            <Text style={styles.optionIcon}>&#x1F4F8;</Text>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>카메라로 촬영</Text>
              <Text style={styles.optionDescription}>
                명함을 직접 촬영합니다
              </Text>
            </View>
            <Text style={styles.optionArrow}>{"\u203A"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={handlePickImage}
            activeOpacity={0.8}
          >
            <Text style={styles.optionIcon}>&#x1F5BC;</Text>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>갤러리에서 선택</Text>
              <Text style={styles.optionDescription}>
                저장된 이미지를 선택합니다
              </Text>
            </View>
            <Text style={styles.optionArrow}>{"\u203A"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  mainIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 40,
  },
  optionButtons: {
    width: "100%",
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: "#6B7280",
  },
  optionArrow: {
    fontSize: 24,
    color: "#D1D5DB",
    fontWeight: "300",
  },
  // Camera styles
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  frameGuide: {
    width: 300,
    height: 180,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "#FFFFFF",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 4,
  },
  guideText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 24,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cameraControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  cancelButton: {
    padding: 12,
  },
  cancelText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
  },
  placeholder: {
    width: 48,
  },
});
