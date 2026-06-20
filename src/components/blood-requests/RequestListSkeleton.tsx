import React from "react";
import { View } from "react-native";
import { useColors } from "@/src/theme/useTheme";

export function RequestListSkeleton() {
  const colors = useColors();

  return (
    <View style={{ paddingHorizontal: 20, gap: 10, opacity: 0.5 }}>
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={{
            height: 150,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            backgroundColor: colors.cardBg,
            overflow: "hidden",
          }}
        >
          <View style={{ height: 2.5, backgroundColor: colors.cardBorder }} />
        </View>
      ))}
    </View>
  );
}
