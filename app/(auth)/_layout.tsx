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
      <Stack.Screen name="login" />
      <Stack.Screen name="register-hospital" />
      <Stack.Screen name="register-cnts" />
    </Stack>
  );
}
