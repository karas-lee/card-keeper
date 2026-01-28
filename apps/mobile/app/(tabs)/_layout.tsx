import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          borderTopColor: "#E5E7EB",
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
        },
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
          headerTitle: "CardKeeper",
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "스캔",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📷</Text>,
          headerTitle: "명함 스캔",
        }}
      />
      <Tabs.Screen
        name="folders"
        options={{
          title: "폴더",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📁</Text>,
          headerTitle: "폴더",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "설정",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚙️</Text>,
          headerTitle: "설정",
        }}
      />
    </Tabs>
  );
}
