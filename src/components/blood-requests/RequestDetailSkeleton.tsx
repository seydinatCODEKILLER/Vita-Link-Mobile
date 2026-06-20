import React from "react";
import { View } from "react-native";
import { useColors } from "@/src/theme/useTheme";

export function RequestDetailSkeleton() {
  const colors = useColors();

  return (
    <View style={{ paddingHorizontal: 20, gap: 12, opacity: 0.5 }}>
      <View
        style={{
          height: 240,
          borderRadius: 20,
          borderWidth: 1.5,
          borderColor: colors.cardBorder,
          backgroundColor: colors.cardBg,
          overflow: "hidden",
        }}
      >
        <View style={{ height: 3, backgroundColor: colors.cardBorder }} />
      </View>
      <View
        style={{
          height: 150,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          backgroundColor: colors.cardBg,
        }}
      />
    </View>
  );
}
