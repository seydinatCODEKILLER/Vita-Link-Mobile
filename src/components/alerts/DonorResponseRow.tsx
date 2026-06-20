import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/src/theme/useTheme";
import { getResponseConfig } from "@/src/constants/alertResponseConfig";
import { AlertResponseStatus } from "@/src/types/shared.types";

interface DonorResponse {
  id: string;
  status: AlertResponseStatus;
  etaMinutes?: number | null;
  arrivedAt?: string | null;
  donor: {
    firstName: string;
    lastName: string;
  };
}

interface DonorResponseRowProps {
  response: DonorResponse;
}

export function DonorResponseRow({ response }: DonorResponseRowProps) {
  const colors = useColors();
  const responseConfig = getResponseConfig(colors);
  const config = responseConfig[response.status] ?? responseConfig.CONFIRMED;

  const initials =
    (response.donor.firstName?.[0] ?? "") +
    (response.donor.lastName?.[0] ?? "");

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 14,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.cardBorder,
      }}
    >
      {/* Avatar initiales */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: colors.cardBorder,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: colors.white, fontSize: 14, fontWeight: "800" }}>
          {initials}
        </Text>
      </View>

      {/* Nom + ETA */}
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ color: colors.white, fontSize: 14, fontWeight: "700" }}>
          {response.donor.firstName} {response.donor.lastName}
        </Text>
        {response.etaMinutes != null && response.status === "CONFIRMED" && (
          <Text style={{ color: colors.blue, fontSize: 12 }}>
            Arrive dans ~{response.etaMinutes} min
          </Text>
        )}
        {response.status === "ARRIVED" && response.arrivedAt && (
          <Text style={{ color: colors.success, fontSize: 12 }}>
            Arrivé il y a quelques instants
          </Text>
        )}
      </View>

      {/* Badge statut */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 20,
          borderWidth: 0.5,
          backgroundColor: config.color + "26",
          borderColor: config.color + "4D",
        }}
      >
        <Ionicons name={config.icon} size={14} color={config.color} />
        <Text style={{ color: config.color, fontSize: 11, fontWeight: "700" }}>
          {config.label}
        </Text>
      </View>
    </View>
  );
}
