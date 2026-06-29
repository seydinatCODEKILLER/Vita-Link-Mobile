import { useAlertDetailStyles } from "@/src/styles/useAlertDetailStyles";
import { useColors } from "@/src/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface AlertInfoGridProps {
  quantityNeeded: number;
  formattedExpiresAt: string;
}

export function AlertInfoGrid({
  quantityNeeded,
  formattedExpiresAt,
}: AlertInfoGridProps) {
  const colors = useColors();
  const styles = useAlertDetailStyles();

  return (
    <View style={styles.infoGrid}>
      {/* Besoin */}
      <View style={styles.infoCard}>
        <View style={[styles.infoIcon, { backgroundColor: colors.red + "20" }]}>
          <Ionicons name="water-outline" size={15} color={colors.red} />
        </View>
        <Text style={styles.infoLabel}>BESOIN</Text>
        <View style={styles.infoValueRow}>
          <Text style={styles.infoValue}>{quantityNeeded}</Text>
          <Text style={styles.infoUnit}>poches</Text>
        </View>
      </View>

      {/* Expire à */}
      <View style={styles.infoCard}>
        <View
          style={[styles.infoIcon, { backgroundColor: colors.amber + "20" }]}
        >
          <Ionicons name="time-outline" size={15} color={colors.amber} />
        </View>
        <Text style={styles.infoLabel}>EXPIRE À</Text>
        <Text style={styles.infoValue}>{formattedExpiresAt}</Text>
      </View>
    </View>
  );
}
