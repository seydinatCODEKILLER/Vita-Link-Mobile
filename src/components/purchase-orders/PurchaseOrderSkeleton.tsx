import React from "react";
import { View } from "react-native";
import { useThemedStyles } from "@/src/theme/useTheme";

export function PurchaseOrderSkeleton() {
  const styles = useThemedStyles((c) => ({
    card: {
      marginHorizontal: 20,
      marginBottom: 10,
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 16,
      gap: 12,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    circle: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: c.cardBorder,
    },
    badge: {
      width: 80,
      height: 22,
      borderRadius: 8,
      backgroundColor: c.cardBorder,
    },
    line: { height: 12, borderRadius: 6, backgroundColor: c.cardBorder },
  }));

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.circle} />
        <View style={styles.badge} />
      </View>
      <View style={[styles.line, { width: "70%" }]} />
      <View style={[styles.line, { width: "50%" }]} />
      <View style={[styles.line, { width: "40%" }]} />
    </View>
  );
}
