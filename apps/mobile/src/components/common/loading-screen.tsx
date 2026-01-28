import { ActivityIndicator, StyleSheet, View } from "react-native";

interface LoadingScreenProps {
  color?: string;
}

export function LoadingScreen({ color = "#6366F1" }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
