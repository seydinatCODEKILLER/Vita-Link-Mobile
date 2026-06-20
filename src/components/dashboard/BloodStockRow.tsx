import React from "react";
import { View, Text } from "react-native";
import { AppColors } from "@/src/theme/colors";
import { BloodStockLevel, BloodType } from "@/src/types/shared.types";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";
import {
  calculateStockLevel,
  getLevelConfig,
} from "@/src/constants/stockLevels";

// ─── BloodStockRow ────────────────────────────────────────────────────────────

interface BloodStockRowProps {
  bloodType: BloodType;
  quantity: number;
  level: BloodStockLevel; // reçu du serveur, recalculé localement
  colors: AppColors;
}

export function BloodStockRow({
  bloodType,
  quantity,
  level: _serverLevel,
  colors,
}: BloodStockRowProps) {
  const level = calculateStockLevel(quantity);
  const { label, color } = getLevelConfig(colors)[level];
  const typeLabel = BLOOD_TYPE_LABELS[bloodType] ?? bloodType.replace("_", "");

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 13,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.cardBorder,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
        <View
          style={{
            minWidth: 38,
            height: 38,
            borderRadius: 10,
            borderWidth: 0.5,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 6,
            backgroundColor: color + "12",
            borderColor: color + "28",
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "900", color }}>
            {typeLabel}
          </Text>
        </View>
        <Text
          style={{ color: colors.textMuted, fontSize: 12, fontWeight: "600" }}
        >
          {label}
        </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
        <Text style={{ fontSize: 19, fontWeight: "900", color }}>
          {quantity}
        </Text>
        <Text
          style={{ color: colors.textMuted, fontSize: 11, fontWeight: "500" }}
        >
          poches
        </Text>
      </View>
    </View>
  );
}

// ─── DashboardSkeleton ────────────────────────────────────────────────────────

interface DashboardSkeletonProps {
  colors: AppColors;
}

export function DashboardSkeleton({ colors }: DashboardSkeletonProps) {
  return (
    <View style={{ paddingHorizontal: 20, gap: 22, opacity: 0.6 }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 80,
              borderRadius: 14,
              borderWidth: 0.5,
              borderColor: colors.cardBorder,
              backgroundColor: colors.cardBg,
              padding: 12,
            }}
          />
        ))}
      </View>
      <View style={{ gap: 10 }}>
        <View
          style={{
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.cardBorder,
            width: "30%",
          }}
        />
        <View
          style={{
            height: 120,
            borderRadius: 16,
            borderWidth: 0.5,
            borderColor: colors.cardBorder,
            backgroundColor: colors.cardBg,
          }}
        />
      </View>
    </View>
  );
}
