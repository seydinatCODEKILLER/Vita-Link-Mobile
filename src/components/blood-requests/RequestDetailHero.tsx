import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/src/theme/useTheme";
import { BloodRequest } from "@/src/types/blood-request.types";

interface RequestDetailHeroProps {
  request: BloodRequest;
  isVital: boolean;
  isPending: boolean;
  progressPct: number;
}

export function RequestDetailHero({
  request,
  isVital,
  isPending,
  progressPct,
}: RequestDetailHeroProps) {
  const colors = useColors();

  const statusLabel = isPending
    ? "En attente"
    : request.status.replace(/_/g, " ");
  const statusColor = isPending ? colors.amber : colors.success;

  return (
    <View
      style={{
        marginHorizontal: 20,
        marginBottom: 14,
        borderRadius: 20,
        backgroundColor: colors.cardBg,
        borderWidth: 1.5,
        borderColor: colors.red + "28",
        overflow: "hidden",
      }}
    >
      <View style={{ height: 3, backgroundColor: colors.red }} />
      <View style={{ padding: 18 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 14,
          }}
        >
          <Text
            style={{
              color: colors.red,
              fontSize: 52,
              fontWeight: "900",
              letterSpacing: -3,
              lineHeight: 52,
            }}
          >
            {request.bloodType.replace("_", "")}
          </Text>
          <View style={{ alignItems: "flex-end", gap: 8 }}>
            {isVital && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: colors.red + "14",
                  borderWidth: 1,
                  borderColor: colors.red + "30",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 9,
                }}
              >
                <Ionicons name="flash" size={11} color={colors.red} />
                <Text
                  style={{
                    color: colors.red,
                    fontSize: 10,
                    fontWeight: "900",
                    letterSpacing: 0.8,
                  }}
                >
                  VITAL
                </Text>
              </View>
            )}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: statusColor + "14",
                paddingHorizontal: 11,
                paddingVertical: 5,
                borderRadius: 20,
              }}
            >
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: statusColor,
                }}
              />
              <Text
                style={{
                  color: statusColor,
                  fontSize: 10,
                  fontWeight: "700",
                }}
              >
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            gap: 6,
            marginBottom: 6,
          }}
        >
          <Text
            style={{
              color: colors.white,
              fontSize: 28,
              fontWeight: "900",
              letterSpacing: -1,
            }}
          >
            {request.quantityNeeded}
          </Text>
          <Text
            style={{
              color: colors.textSubtle,
              fontSize: 13,
              fontWeight: "600",
            }}
          >
            poches nécessaires
          </Text>
        </View>

        {request.quantityProvided > 0 && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 14,
            }}
          >
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: colors.success,
              }}
            />
            <Text
              style={{
                color: colors.success,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {request.quantityProvided} poches déjà fournies
            </Text>
          </View>
        )}

        {request.quantityProvided > 0 && (
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  letterSpacing: 0.6,
                  color: colors.textSubtle,
                  textTransform: "uppercase",
                }}
              >
                Progression
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: colors.success,
                }}
              >
                {progressPct}%
              </Text>
            </View>
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
                  width: `${progressPct}%`,
                  borderRadius: 3,
                  backgroundColor: colors.success,
                }}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
