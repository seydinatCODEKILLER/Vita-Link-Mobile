import { Stack } from "expo-router";
import { useColors } from "@/src/theme/useTheme";

export default function AuthLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="register-donor" />
      <Stack.Screen name="register-structure" />
      <Stack.Screen name="otp-verify" />
      <Stack.Screen name="login" />
      <Stack.Screen name="reconnect-donor" />
      <Stack.Screen name="reconnect-hospital" />
      <Stack.Screen name="reconnect-cnts" />
    </Stack>
  );
}
