import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

export const EmptyState = ({ icon, title, subtitle }: EmptyStateProps) => {
  const colors = useColors();

  const styles = useThemedStyles((c) => ({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 40,
      paddingTop: 80,
    },
    iconWrap: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: c.redGlow,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    title: {
      color: c.white,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 6,
      textAlign: "center",
    },
    subtitle: {
      color: c.textMuted,
      fontSize: 14,
      textAlign: "center",
      lineHeight: 22,
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={32} color={colors.red} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};
