import React from "react";
import { View } from "react-native";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";

export function AlertDetailSkeleton() {
  const colors = useColors();

  const styles = useThemedStyles((c) => ({
    cardBg: {
      backgroundColor: c.cardBg,
      borderRadius: 20,
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
    <View style={{ paddingHorizontal: 20, gap: 12, opacity: 0.6 }}>
      {/* Fake Hero */}
      <View style={[styles.cardBg, { padding: 18, gap: 14 }]}>
        <View style={{ flexDirection: "row", gap: 14 }}>
          <View
            style={{
              width: 58,
              height: 58,
              borderRadius: 16,
              backgroundColor: colors.cardBorder,
            }}
          />
          <View style={{ flex: 1, gap: 8, justifyContent: "center" }}>
            <View style={[styles.line, { width: "70%" }]} />
            <View style={[styles.line, { width: "40%", height: 8 }]} />
          </View>
        </View>
        <View
          style={{
            height: 30,
            borderRadius: 11,
            backgroundColor: colors.cardBorder,
          }}
        />
      </View>

      {/* Fake Info Grid */}
      <View style={{ flexDirection: "row", gap: 9 }}>
        <View
          style={[styles.cardBg, { flex: 1, height: 90, borderRadius: 14 }]}
        />
        <View
          style={[styles.cardBg, { flex: 1, height: 90, borderRadius: 14 }]}
        />
      </View>

      {/* Fake Progress */}
      <View style={[styles.cardBg, { height: 80, borderRadius: 14 }]} />
    </View>
  );
}
