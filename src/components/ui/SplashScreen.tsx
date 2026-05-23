import { View, Text, ActivityIndicator } from "react-native";
import { useColors } from "@/src/theme/useTheme";

export function SplashScreen() {
  const colors = useColors();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          backgroundColor: colors.red,
          borderRadius: 24,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 36 }}>🩸</Text>
      </View>

      <Text
        style={{
          color: colors.white,
          fontSize: 30,
          fontWeight: "800",
          letterSpacing: -0.5,
        }}
      >
        Vita<Text style={{ color: colors.red }}>Link</Text>
      </Text>

      <ActivityIndicator color={colors.red} style={{ marginTop: 8 }} />
    </View>
  );
}
