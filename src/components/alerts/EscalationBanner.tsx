import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/src/theme/useTheme";

export function EscalationBanner() {
  const colors = useColors();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: colors.amber + "12",
        borderWidth: 0.5,
        borderColor: colors.amber + "30",
        borderRadius: 12,
        padding: 12,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: colors.amber + "1F",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="business-outline" size={16} color={colors.amber} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: colors.amber, fontSize: 12, fontWeight: "700" }}>
          Escalade Hôpital
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>
          Alerte créée suite à une demande de sang critique d&apos;un hôpital
          affilié.
        </Text>
      </View>
    </View>
  );
}
