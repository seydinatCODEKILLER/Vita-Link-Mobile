import React from "react";
import { View } from "react-native";
import { useThemedStyles } from "@/src/theme/useTheme";

export function DonationDaySkeleton() {
  const styles = useThemedStyles((c) => ({
    card: {
      backgroundColor: c.cardBg,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.cardBorder,
      marginBottom: 12,
      overflow: "hidden",
      opacity: 0.5,
    },
    imagePlaceholder: { height: 110, backgroundColor: c.cardBorder },
    content: { padding: 12, gap: 8 },
    line1: {
      height: 13,
      width: "70%",
      borderRadius: 7,
      backgroundColor: c.cardBorder,
    },
    line2: {
      height: 9,
      width: "35%",
      borderRadius: 5,
      backgroundColor: c.cardBorder,
    },
    line3: {
      height: 9,
      width: "40%",
      borderRadius: 5,
      backgroundColor: c.cardBorder,
    },
    line4: {
      height: 3,
      borderRadius: 2,
      backgroundColor: c.cardBorder,
      marginTop: 2,
    },
  }));

  return (
    <View style={styles.card}>
      <View style={styles.imagePlaceholder} />
      <View style={styles.content}>
        <View style={styles.line1} />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={styles.line2} />
          <View style={styles.line3} />
        </View>
        <View style={styles.line4} />
      </View>
    </View>
  );
}
