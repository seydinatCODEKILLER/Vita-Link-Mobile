import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import { useColors } from "@/src/theme/useTheme";
import { BloodRequest } from "@/src/types/blood-request.types";
import { STATUS_CONFIG } from "@/src/constants/bloodRequestConfig";

dayjs.extend(relativeTime);
dayjs.locale("fr");

interface RequestCardProps {
  item: BloodRequest;
  onPress: () => void;
}

export function RequestCard({ item, onPress }: RequestCardProps) {
  const colors = useColors();
  const config = STATUS_CONFIG(colors)[item.status];
  const isVital = item.urgencyLevel === "VITAL";

  // ... (Le JSX reste exactement le même, il utilise juste `colors` localement)
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: 18,
        borderWidth: isVital ? 1.5 : 1,
        borderColor: isVital ? colors.red + "30" : colors.cardBorder,
        overflow: "hidden",
        marginBottom: 10,
      }}
    >
      <View
        style={{
          height: 2.5,
          backgroundColor: config.stripeColor,
          opacity: 0.85,
        }}
      />
      <View style={{ padding: 14 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              flex: 1,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.cardBorder,
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Ionicons
                name="business-outline"
                size={18}
                color={colors.textSubtle}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.white,
                  fontWeight: "700",
                  fontSize: 14,
                  marginBottom: 2,
                }}
                numberOfLines={1}
              >
                {item.requestingHospital.name}
              </Text>
              <Text style={{ color: colors.textSubtle, fontSize: 10 }}>
                {dayjs(item.createdAt).fromNow()}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 20,
              backgroundColor: config.color + "14",
              flexShrink: 0,
              marginLeft: 8,
            }}
          >
            <View
              style={{
                width: 5,
                height: 5,
                borderRadius: 3,
                backgroundColor: config.color,
              }}
            />
            <Text
              style={{ color: config.color, fontSize: 10, fontWeight: "700" }}
            >
              {config.label}
            </Text>
          </View>
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: colors.cardBorder,
            marginBottom: 12,
          }}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 0 }}>
            <Text
              style={{
                color: colors.red,
                fontWeight: "900",
                fontSize: 26,
                letterSpacing: -1,
                marginRight: 10,
              }}
            >
              {item.bloodType.replace("_", "")}
            </Text>
            <View
              style={{
                width: 1,
                height: 22,
                backgroundColor: colors.cardBorder,
                marginRight: 10,
              }}
            />
            <View>
              <Text
                style={{
                  color: colors.white,
                  fontWeight: "800",
                  fontSize: 14,
                  lineHeight: 16,
                }}
              >
                {item.quantityNeeded}
              </Text>
              <Text
                style={{
                  color: colors.textSubtle,
                  fontSize: 10,
                  lineHeight: 13,
                }}
              >
                poches
              </Text>
            </View>
          </View>

          {isVital && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: "rgba(220,30,30,0.1)",
                borderWidth: 1,
                borderColor: "rgba(220,30,30,0.2)",
                paddingHorizontal: 9,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Ionicons name="flash" size={10} color={colors.red} />
              <Text
                style={{
                  color: colors.red,
                  fontSize: 9,
                  fontWeight: "900",
                  letterSpacing: 0.8,
                }}
              >
                VITAL
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
