import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { BloodStockLevel, BloodType } from "@/src/types/shared.types";
import {
  BLOOD_TYPES_CONFIG,
  calculateStockLevel,
  getStockLevelConfig,
} from "@/src/constants/stockScreen";

interface StockCardProps {
  stock: { bloodType: BloodType; quantity: number; level: BloodStockLevel };
  onPress: () => void;
}

export function StockCard({ stock, onPress }: StockCardProps) {
  const colors = useColors();
  const STOCK_LEVEL_CONFIG = getStockLevelConfig(colors);

  const config = BLOOD_TYPES_CONFIG.find((b) => b.value === stock.bloodType);

  // Le niveau est toujours recalculé localement à partir de la quantité réelle
  const computedLevel = calculateStockLevel(stock.quantity);
  const lvlConfig = STOCK_LEVEL_CONFIG[computedLevel];

  // Plafond de la jauge à 50 poches (réaliste pour une CNTS)
  const progressPct = Math.min((stock.quantity / 50) * 100, 100);

  const styles = useThemedStyles((c) => ({
    stockCard: {
      width: "48%",
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 0.5,
      padding: 15,
      gap: 8,
      position: "relative",
      overflow: "hidden",
    },
    cardGlow: {
      position: "absolute",
      top: -24,
      right: -24,
      width: 90,
      height: 90,
      borderRadius: 45,
      opacity: 0.5,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    bloodLabel: { color: c.white, fontSize: 22, fontWeight: "900" },
    levelChip: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    rareBadge: {
      alignSelf: "flex-start",
      backgroundColor: "#F9731614",
      borderWidth: 0.5,
      borderColor: "#F9731628",
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 5,
    },
    rareBadgeText: { color: "#F97316", fontSize: 9, fontWeight: "700" },
    quantityText: {
      color: c.white,
      fontSize: 32,
      fontWeight: "900",
      letterSpacing: -1,
    },
    levelLabel: { fontSize: 11, fontWeight: "700" },
    barBg: { height: 4, borderRadius: 2, backgroundColor: c.cardBorder },
    barFill: { height: "100%", borderRadius: 2 },
  }));

  return (
    <TouchableOpacity
      style={[styles.stockCard, { borderColor: lvlConfig.color + "22" }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.cardGlow, { backgroundColor: lvlConfig.color + "18" }]} />
      <View style={styles.cardHeader}>
        <Text style={styles.bloodLabel}>{config?.label}</Text>
        <View style={[styles.levelChip, { backgroundColor: lvlConfig.color + "15" }]}>
          <Ionicons name={lvlConfig.icon} size={14} color={lvlConfig.color} />
        </View>
      </View>
      {config?.isRare && (
        <View style={styles.rareBadge}>
          <Text style={styles.rareBadgeText}>Rare</Text>
        </View>
      )}
      <Text style={styles.quantityText}>{stock.quantity}</Text>
      <Text style={[styles.levelLabel, { color: lvlConfig.color }]}>
        {lvlConfig.label}
      </Text>
      <View style={styles.barBg}>
        <View
          style={[
            styles.barFill,
            { width: `${progressPct}%`, backgroundColor: lvlConfig.color },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}