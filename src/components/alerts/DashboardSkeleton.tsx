import React from "react";
import { View } from "react-native";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";

export function DashboardSkeleton() {
  const colors = useColors();

  const styles = useThemedStyles((c) => ({
    cardBg: {
      backgroundColor: c.cardBg,
      borderRadius: 18,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
    },
    line: {
      height: 10,
      borderRadius: 5,
      backgroundColor: c.cardBorder,
    },
  }));

  return (
    <View
      style={{ paddingHorizontal: 20, paddingTop: 10, gap: 20, opacity: 0.6 }}
    >
      {/* Fake Header */}
      <View
        style={[
          styles.cardBg,
          { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
        ]}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            backgroundColor: colors.cardBorder,
          }}
        />
        <View style={{ flex: 1, gap: 8 }}>
          <View style={[styles.line, { width: "50%" }]} />
          <View style={[styles.line, { width: "70%", height: 8 }]} />
        </View>
      </View>

      {/* Fake Summary */}
      <View style={[styles.cardBg, { height: 120 }]} />

      {/* Fake List */}
      <View style={{ gap: 8 }}>
        <View style={[styles.line, { width: "40%", height: 8 }]} />
        <View style={[styles.cardBg, { height: 200 }]} />
      </View>
    </View>
  );
}
