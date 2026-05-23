import "./global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { queryClient } from "@/src/config/query-client.config";
import { SplashScreen } from "@/src/components/ui/SplashScreen";
import { useAuthStore } from "@/src/store/auth.store";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/src/config/toast.config";
import { useThemeStore } from "@/src/store/theme.store";
import { useColors } from "@/src/theme/useTheme";

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const isLoading = useAuthStore((s) => s.isLoading);

  // Tous les hooks au niveau racine — jamais dans le JSX
  const hydrateTheme = useThemeStore((s) => s.hydrateTheme);
  const theme = useThemeStore((s) => s.theme);
  const colors = useColors();

  useEffect(() => {
    const init = async () => {
      await hydrateTheme(); // thème d'abord pour éviter le flash
      await initialize();
    };
    init();
  }, []);

  if (isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <SplashScreen />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style={theme === "dark" ? "light" : "dark"} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(donor)" />
            <Stack.Screen name="(health)" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <Toast config={toastConfig} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
