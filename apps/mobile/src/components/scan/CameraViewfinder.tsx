import React, { useRef, useState, useCallback } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions, type CameraType } from "expo-camera";
import { FrameGuide } from "./FrameGuide";

interface CameraViewfinderProps {
  onCapture: (uri: string) => void;
  onClose?: () => void;
  isCapturing?: boolean;
  setIsCapturing?: (v: boolean) => void;
}

export function CameraViewfinder({
  onCapture,
  onClose,
  isCapturing: externalCapturing,
  setIsCapturing: externalSetCapturing,
}: CameraViewfinderProps) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [internalCapturing, setInternalCapturing] = useState(false);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<"off" | "on" | "auto">("auto");

  const isCapturing = externalCapturing ?? internalCapturing;
  const setIsCapturing = externalSetCapturing ?? setInternalCapturing;

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        onCapture(photo.uri);
      }
    } catch {
      Alert.alert("촬영 실패", "사진 촬영 중 오류가 발생했습니다.");
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, setIsCapturing, onCapture]);

  const toggleFlash = () => {
    setFlash((prev) => {
      if (prev === "auto") return "on";
      if (prev === "on") return "off";
      return "auto";
    });
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          카메라 권한이 필요합니다
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>권한 허용</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const flashLabel = flash === "auto" ? "AUTO" : flash === "on" ? "ON" : "OFF";

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
      >
        {/* Top controls */}
        <View style={styles.topControls}>
          {onClose ? (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>{"\u2715"}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
          <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
            <Text style={styles.flashText}>{"\u26A1"} {flashLabel}</Text>
          </TouchableOpacity>
        </View>

        {/* Frame Guide */}
        <View style={styles.frameArea}>
          <FrameGuide />
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          <View style={styles.placeholderButton} />
          <TouchableOpacity
            style={[
              styles.captureButton,
              isCapturing && styles.captureDisabled,
            ]}
            onPress={handleCapture}
            disabled={isCapturing}
            activeOpacity={0.7}
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.flipButton} onPress={toggleFacing}>
            <Text style={styles.flipIcon}>{"\uD83D\uDD04"}</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  permissionText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  flashButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  flashText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  placeholder: {
    width: 36,
  },
  frameArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  placeholderButton: {
    width: 48,
    height: 48,
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
  captureDisabled: {
    opacity: 0.5,
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
  },
  flipButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  flipIcon: {
    fontSize: 22,
  },
});
