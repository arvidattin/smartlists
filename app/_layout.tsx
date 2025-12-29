import { Stack } from "expo-router";
import "../global.css";
import { useThemePersistence } from "../hooks/useThemePersistence";

export default function RootLayout() {
  useThemePersistence();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-in" options={{ animation: "fade" }} />
      <Stack.Screen name="sign-up" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
    </Stack>
  );
}
