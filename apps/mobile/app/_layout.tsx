import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppProviders } from "../src/providers";

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="card/[id]" options={{ headerShown: true, title: "명함 상세" }} />
        <Stack.Screen name="card/new" options={{ headerShown: true, title: "명함 추가" }} />
        <Stack.Screen name="card/edit/[id]" options={{ headerShown: true, title: "명함 수정" }} />
        <Stack.Screen
          name="scan/confirm"
          options={{ headerShown: true, title: "스캔 결과 확인" }}
        />
        <Stack.Screen name="folder/[id]" options={{ headerShown: true, title: "폴더" }} />
        <Stack.Screen name="tags/manage" options={{ headerShown: true, title: "태그 관리" }} />
        <Stack.Screen name="settings/profile" options={{ headerShown: true, title: "프로필 편집" }} />
        <Stack.Screen name="settings/export" options={{ headerShown: true, title: "데이터 내보내기" }} />
        <Stack.Screen name="settings/help" options={{ headerShown: true, title: "도움말" }} />
      </Stack>
      <StatusBar style="auto" />
    </AppProviders>
  );
}
