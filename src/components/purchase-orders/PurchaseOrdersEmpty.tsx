import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";

interface PurchaseOrdersEmptyProps {
  label: string;
}

export function PurchaseOrdersEmpty({ label }: PurchaseOrdersEmptyProps) {
  const colors = useColors();

  const styles = useThemedStyles((c) => ({
    container: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 80,
      gap: 12,
    },
    iconWrap: {
      width: 72,
      height: 72,
      borderRadius: 20,
      backgroundColor: c.cardBg,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    title: { color: c.white, fontSize: 15, fontWeight: "700" },
    text: {
      color: c.textMuted,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 19,
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons
          name="document-text-outline"
          size={32}
          color={colors.textSubtle}
        />
      </View>
      <Text style={styles.title}>Aucun bon {label}</Text>
      <Text style={styles.text}>
        Les bons de commande {label}s apparaîtront ici.
      </Text>
    </View>
  );
}
