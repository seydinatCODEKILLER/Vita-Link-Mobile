import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useThemeStore } from "@/src/store/theme.store";
import { darkColors, lightColors, type AppColors } from "./colors";

export const useColors = (): AppColors => {
  const theme = useThemeStore((s) => s.theme);
  return theme === "dark" ? darkColors : lightColors;
};

// Remplace StyleSheet.create — se recalcule uniquement quand le thème change
export const useThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  styleFactory: (colors: AppColors) => T,
) => {
  const colors = useColors();
  return useMemo(() => StyleSheet.create(styleFactory(colors)), [colors]);
};