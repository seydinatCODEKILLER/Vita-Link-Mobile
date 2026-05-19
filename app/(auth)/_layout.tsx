import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#080808" },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="register-donor" />
      <Stack.Screen name="register-structure" />
      <Stack.Screen name="otp-verify" />
      <Stack.Screen name="login" />
      <Stack.Screen name="reconnect-donor" />
    </Stack>
  );
}
