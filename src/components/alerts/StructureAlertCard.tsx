import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { AppColors } from "@/src/theme/colors";
import { Alert as AlertType } from "@/src/types/alert.types";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";
import { getOriginConfig, getStatusConfig } from "@/src/constants/alertsList";

interface StructureAlertCardProps {
  alert: AlertType;
  onPress: (id: string) => void;
  colors: AppColors;
  statusConfig: ReturnType<typeof getStatusConfig>;
}

export function StructureAlertCard({
  alert,
  onPress,
  colors,
  statusConfig,
}: StructureAlertCardProps) {
  const config = statusConfig[alert.status];
  const originConfig = getOriginConfig(colors);
  const bloodLabel =
    BLOOD_TYPE_LABELS[alert.bloodType] ?? alert.bloodType.replace("_", "");
  const isVital = alert.urgencyLevel === "VITAL";
  const progressPct =
    alert.quantityNeeded > 0
      ? Math.min((alert.quantityConfirmed / alert.quantityNeeded) * 100, 100)
      : 0;

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: colors.cardBorder,
        padding: 14,
        marginBottom: 12,
        gap: 12,
      }}
      onPress={() => onPress(alert.id)}
      activeOpacity={0.7}
    >
      {/* Top Row */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            ...(isVital
              ? {
                  backgroundColor: "rgba(220,30,30,0.15)",
                  borderWidth: 1,
                  borderColor: "rgba(220,30,30,0.40)",
                }
              : {
                  backgroundColor: colors.amber + "1A",
                  borderWidth: 1,
                  borderColor: colors.amber + "4D",
                }),
          }}
        >
          <Text
            style={{ color: colors.white, fontSize: 16, fontWeight: "900" }}
          >
            {bloodLabel}
          </Text>
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{ color: colors.white, fontSize: 15, fontWeight: "700" }}
            numberOfLines={1}
          >
            {isVital ? "Urgence Vitale" : "Alerte Standard"}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            {dayjs(alert.createdAt).fromNow()}
          </Text>
        </View>

        {/* Badge d'Origine (Escalade) */}
        {alert.origin === "CNTS_ESCALATION" && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
              paddingHorizontal: 6,
              paddingVertical: 3,
              borderRadius: 6,
              borderWidth: 0.5,
              backgroundColor: originConfig.CNTS_ESCALATION.color + "14",
              borderColor: originConfig.CNTS_ESCALATION.color + "30",
              marginRight: 4,
            }}
          >
            <Ionicons
              name="arrow-up-circle"
              size={10}
              color={originConfig.CNTS_ESCALATION.color}
            />
            <Text
              style={{
                color: originConfig.CNTS_ESCALATION.color,
                fontSize: 9,
                fontWeight: "700",
              }}
            >
              Escalade
            </Text>
          </View>
        )}

        {/* Badge Statut */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            borderWidth: 0.5,
            backgroundColor: config.color + "14",
            borderColor: config.color + "30",
          }}
        >
          <Ionicons name={config.icon} size={12} color={config.color} />
          <Text
            style={{ color: config.color, fontSize: 10, fontWeight: "700" }}
          >
            {config.label}
          </Text>
        </View>
      </View>

      {/* Progress Row */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="people-outline" size={14} color={colors.textMuted} />
          <Text
            style={{ color: colors.textMuted, fontSize: 12, fontWeight: "500" }}
          >
            <Text style={{ color: colors.white, fontWeight: "700" }}>
              {alert.quantityConfirmed}
            </Text>
            /{alert.quantityNeeded} donneurs
          </Text>
        </View>
        <View
          style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.cardBorder,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              borderRadius: 2,
              width: `${progressPct}%` as any,
              backgroundColor:
                alert.status === "QUOTA_REACHED" ? colors.success : colors.red,
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}
