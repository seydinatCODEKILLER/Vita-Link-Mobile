import React from "react";
import { View } from "react-native";
import { useThemedStyles } from "@/src/theme/useTheme";

export function StaffSkeleton() {
  const styles = useThemedStyles((c) => ({
    cardBg: {
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
    },
    line: { height: 10, borderRadius: 5, backgroundColor: c.cardBorder },
    circlePlaceholder: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: c.cardBorder,
    },
  }));

  return (
    <View style={{ paddingHorizontal: 20, gap: 9, opacity: 0.6 }}>
      <View
        style={[
          styles.line,
          { width: "30%", height: 8, marginTop: 6, marginBottom: 10 },
        ]}
      />
      {[1, 2].map((i) => (
        <View
          key={`dir-${i}`}
          style={[
            styles.cardBg,
            {
              flexDirection: "row",
              alignItems: "center",
              gap: 13,
              padding: 13,
            },
          ]}
        >
          <View style={styles.circlePlaceholder} />
          <View style={{ flex: 1, gap: 6 }}>
            <View style={[styles.line, { width: "50%" }]} />
            <View style={[styles.line, { width: "70%", height: 8 }]} />
          </View>
        </View>
      ))}
      <View
        style={[
          styles.line,
          { width: "40%", height: 8, marginTop: 16, marginBottom: 10 },
        ]}
      />
      {[1, 2, 3].map((i) => (
        <View
          key={`agt-${i}`}
          style={[
            styles.cardBg,
            {
              flexDirection: "row",
              alignItems: "center",
              gap: 13,
              padding: 13,
            },
          ]}
        >
          <View style={styles.circlePlaceholder} />
          <View style={{ flex: 1, gap: 6 }}>
            <View style={[styles.line, { width: "60%" }]} />
            <View style={[styles.line, { width: "80%", height: 8 }]} />
          </View>
        </View>
      ))}
    </View>
  );
}
