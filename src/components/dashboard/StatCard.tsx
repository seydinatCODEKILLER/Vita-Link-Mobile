import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemedStyles } from "@/src/theme/useTheme";

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  unit?: string;
  color: string;
}

export function StatCard({ icon, label, value, unit, color }: StatCardProps) {
  const styles = useThemedStyles((c) => ({
    statCard: {
      flex: 1,
      backgroundColor: c.cardBg,
      borderRadius: 14,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 12,
      gap: 9,
    },
    statIcon: {
      width: 30,
      height: 30,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
    },
    statLabel: {
      color: c.textMuted,
      fontSize: 9,
      fontWeight: "600",
      letterSpacing: 0.4,
    },
  }));

  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={15} color={color} />
      </View>
      <View style={{ gap: 2 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "900",
            letterSpacing: -0.5,
            color,
          }}
        >
          {value}
          {unit ? (
            <Text style={{ fontSize: 11, fontWeight: "600" }}> {unit}</Text>
          ) : null}
        </Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}
