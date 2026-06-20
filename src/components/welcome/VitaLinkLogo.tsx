import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/src/theme/useTheme";

export function VitaLinkLogo() {
  const colors = useColors(); // ← Autonome

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
      <View
        style={{
          width: 30,
          height: 30,
          backgroundColor: colors.red,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="heart" size={14} color="#FFFFFF" />
      </View>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 17,
          fontWeight: "700",
          letterSpacing: -0.3,
        }}
      >
        Vita<Text style={{ color: colors.red }}>Link</Text>
      </Text>
    </View>
  );
}
