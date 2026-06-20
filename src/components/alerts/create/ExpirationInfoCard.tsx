import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";

export function ExpirationInfoCard() {
  const colors = useColors();
  const styles = useThemedStyles((c) => ({
    infoCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      backgroundColor: c.success + "12",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.success + "2E",
      padding: 14,
    },
    infoCardIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: c.success + "1F",
      alignItems: "center",
      justifyContent: "center",
    },
    infoCardTitle: {
      color: c.success,
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 2,
    },
    infoCardText: { color: c.success + "B3", fontSize: 12, lineHeight: 18 },
  }));

  return (
    <View style={styles.infoCard}>
      <View style={styles.infoCardIcon}>
        <Ionicons name="timer-outline" size={18} color={colors.success} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.infoCardTitle}>Expiration automatique</Text>
        <Text style={styles.infoCardText}>
          Les alertes VITAL expirent après{" "}
          <Text style={{ color: colors.success, fontWeight: "700" }}>
            1 heure
          </Text>{" "}
          et les alertes STANDARD après{" "}
          <Text style={{ color: colors.success, fontWeight: "700" }}>
            4 heures
          </Text>
          . Vous pourrez aussi la fermer manuellement à tout moment.
        </Text>
      </View>
    </View>
  );
}
