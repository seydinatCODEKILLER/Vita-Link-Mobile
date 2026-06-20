import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";

interface ScanGateScreenProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

/**
 * Écran générique pour les états bloquants du scanner :
 * accès restreint, structure en attente, permission caméra refusée.
 */
export function ScanGateScreen({ icon, title, subtitle }: ScanGateScreenProps) {
  const colors = useColors();
  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    centered: {
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: 24,
    },
    title: {
      color: c.white,
      fontSize: 18,
      fontWeight: "700",
      marginTop: 16,
      textAlign: "center",
    },
    subtitle: {
      color: c.textMuted,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
    },
  }));

  return (
    <View style={[styles.container, styles.centered]}>
      <Ionicons name={icon} size={64} color={colors.textSubtle} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

/**
 * État de chargement (permission caméra en cours de résolution).
 */
export function ScanLoadingScreen() {
  const colors = useColors();
  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    centered: {
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: 24,
    },
  }));

  return (
    <View style={[styles.container, styles.centered]}>
      <ActivityIndicator color={colors.red} size="large" />
    </View>
  );
}
