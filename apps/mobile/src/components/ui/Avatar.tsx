import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  imageUrl?: string | null;
  name?: string;
  size?: AvatarSize;
  style?: StyleProp<ViewStyle>;
}

const sizeMap: Record<AvatarSize, { container: number; text: number }> = {
  sm: { container: 32, text: 13 },
  md: { container: 44, text: 18 },
  lg: { container: 64, text: 26 },
  xl: { container: 96, text: 38 },
};

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}

export function Avatar({
  imageUrl,
  name,
  size = "md",
  style,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const dimensions = sizeMap[size];
  const showImage = imageUrl && !imageError;

  return (
    <View
      style={[
        styles.container,
        {
          width: dimensions.container,
          height: dimensions.container,
          borderRadius: dimensions.container / 2,
        },
        style,
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            {
              width: dimensions.container,
              height: dimensions.container,
              borderRadius: dimensions.container / 2,
            },
          ]}
          onError={() => setImageError(true)}
        />
      ) : (
        <Text style={[styles.initials, { fontSize: dimensions.text }]}>
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    resizeMode: "cover",
  },
  initials: {
    fontWeight: "700",
    color: "#6366F1",
  },
});
