import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.errorCode}>404</Text>
      <Text style={styles.title}>
        {"\uD398\uC774\uC9C0\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4"}
      </Text>
      <Text style={styles.description}>
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </Text>
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.replace("/")}
        activeOpacity={0.8}
      >
        <Text style={styles.homeButtonText}>
          {"\uD648\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: "#F9FAFB",
  },
  errorCode: {
    fontSize: 72,
    fontWeight: "800",
    color: "#6366F1",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  homeButton: {
    backgroundColor: "#6366F1",
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 14,
    alignItems: "center",
  },
  homeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
