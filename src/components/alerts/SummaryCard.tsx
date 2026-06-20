import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/src/theme/useTheme";

interface SummaryCardProps {
  confirmed: number;
  arrived: number;
  noShow: number;
  quantityNeeded: number;
}

export function SummaryCard({
  confirmed,
  arrived,
  noShow,
  quantityNeeded,
}: SummaryCardProps) {
  const colors = useColors();

  const total = confirmed + arrived;
  const progressPct = quantityNeeded > 0 ? (total / quantityNeeded) * 100 : 0;
  const isQuotaReached = total >= quantityNeeded;

  const stats = [
    {
      icon: "walk-outline" as const,
      value: confirmed,
      label: "En route",
      color: colors.blue,
    },
    {
      icon: "checkmark-circle-outline" as const,
      value: arrived,
      label: "Arrivés",
      color: colors.success,
    },
    {
      icon: "alert-circle-outline" as const,
      value: noShow,
      label: "Absents",
      color: colors.amber,
    },
  ];

  return (
    <View
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: 18,
        borderWidth: 0.5,
        borderColor: colors.cardBorder,
        padding: 18,
        gap: 16,
      }}
    >
      {/* Stats row */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {stats.map((item, i) => (
          <React.Fragment key={item.label}>
            <View style={{ flex: 1, alignItems: "center", gap: 6 }}>
              <Ionicons name={item.icon} size={18} color={item.color} />
              <Text
                style={{ fontSize: 24, fontWeight: "900", color: item.color }}
              >
                {item.value}
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 11,
                  fontWeight: "600",
                }}
              >
                {item.label}
              </Text>
            </View>
            {i < stats.length - 1 && (
              <View
                style={{
                  width: 0.5,
                  height: 40,
                  backgroundColor: colors.cardBorder,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Progress */}
      <View style={{ gap: 8 }}>
        <Text
          style={{ color: colors.textMuted, fontSize: 13, fontWeight: "600" }}
        >
          Quota :{" "}
          <Text style={{ color: colors.white, fontWeight: "800" }}>
            {total}
          </Text>{" "}
          / {quantityNeeded} donneurs
        </Text>
        <View
          style={{
            height: 6,
            borderRadius: 3,
            backgroundColor: colors.cardBorder,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              borderRadius: 3,
              width: `${Math.min(progressPct, 100)}%` as any,
              backgroundColor: isQuotaReached ? colors.success : colors.red,
            }}
          />
        </View>
      </View>
    </View>
  );
}
