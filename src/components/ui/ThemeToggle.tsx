import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useThemeStore } from "@/src/store/theme.store";
import { useColors } from "@/src/theme/useTheme";

interface ThemeToggleProps {
  size?: number;
}

export function ThemeToggle({ size = 40 }: ThemeToggleProps) {
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const theme = useThemeStore((s) => s.theme);
  const colors = useColors();

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      activeOpacity={0.75}
      style={[
        styles.btn,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: colors.cardBg,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <Ionicons
        name={theme === "dark" ? "sunny-outline" : "moon-outline"}
        size={size * 0.45}
        color={theme === "dark" ? colors.amber : colors.textMuted}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
