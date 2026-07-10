import "../global.css";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useAppStore } from "@/lib/store";
import { DarkTheme, ThemeProvider } from "expo-router/react-navigation";
import { useFonts } from "expo-font";
import {
  SpaceGrotesk_700Bold,
  SpaceGrotesk_600SemiBold,
} from "@expo-google-fonts/space-grotesk";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

SplashScreen.preventAutoHideAsync().catch(() => {});

const CustomPurpleTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0E0720",
    card: "#1B1035",
    text: "#FFFFFF",
    border: "rgba(255, 255, 255, 0.05)",
    primary: "#7C5CFF",
  },
};

export default function RootLayout() {
  const initializeStore = useAppStore((state) => state.initializeStore);

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_700Bold,
    SpaceGrotesk_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  useEffect(() => {
    if (!fontsLoaded) return;
    // Hide native splash screen and initialize Zustand store
    const init = async () => {
      try {
        await initializeStore();
      } catch (e) {
        console.error("Store initialization failed", e);
      } finally {
        await SplashScreen.hideAsync().catch(() => {});
      }
    };
    init();
  }, [fontsLoaded]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={CustomPurpleTheme}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#0E0720" },
              animation: "fade_from_bottom",
            }}
          />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
