import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/src/theme/useTheme";
import { useAlertDetailStyles } from "@/src/hooks/useAlertDetailStyles";

// Constante centralisée pour éviter les rgba hardcodés éparpillés
const VITAL_COLOR = {
  bg: "rgba(220,30,30,0.14)",
  border: "rgba(220,30,30,0.40)",
  glow: "rgba(220,30,30,0.10)",
  heroBorder: "rgba(220,30,30,0.30)",
} as const;

interface AlertHeroCardProps {
  bloodLabel: string;
  hospitalName: string;
  serviceUnit: string | null | undefined;
  isVital: boolean;
  isActive: boolean;
  isExpired: boolean;
  statusColor: string;
}

export function AlertHeroCard({
  bloodLabel,
  hospitalName,
  serviceUnit,
  isVital,
  isActive,
  isExpired,
  statusColor,
}: AlertHeroCardProps) {
  const colors = useColors();
  const styles = useAlertDetailStyles();

  return (
    <View
      style={[
        styles.heroCard,
        {
          borderColor: isVital ? VITAL_COLOR.heroBorder : colors.amber + "38",
        },
      ]}
    >
      {/* Glow background */}
      <View
        style={[
          styles.heroGlow,
          {
            backgroundColor: isVital ? VITAL_COLOR.glow : colors.amber + "14",
          },
        ]}
      />

      <View style={styles.heroTop}>
        {/* Blood badge */}
        <View
          style={[
            styles.bloodBadge,
            isVital
              ? {
                  backgroundColor: VITAL_COLOR.bg,
                  borderWidth: 0.5,
                  borderColor: VITAL_COLOR.border,
                }
              : {
                  backgroundColor: colors.amber + "1A",
                  borderWidth: 0.5,
                  borderColor: colors.amber + "4D",
                },
          ]}
        >
          <Text style={styles.bloodBadgeText}>{bloodLabel}</Text>
        </View>

        {/* Info */}
        <View style={styles.heroInfo}>
          <Text style={styles.hospitalName} numberOfLines={2}>
            {hospitalName}
          </Text>
          <Text style={styles.serviceUnit}>
            {serviceUnit?.replaceAll("_", " ") ?? "Urgence"}
          </Text>
          {isVital && (
            <View style={styles.vitalPill}>
              <Ionicons name="flash" size={10} color={colors.red} />
              <Text style={styles.vitalPillText}>VITAL</Text>
            </View>
          )}
        </View>
      </View>

      {/* Statut */}
      <View
        style={[
          styles.statusRow,
          isActive
            ? styles.statusActive
            : isExpired
              ? styles.statusExpired
              : styles.statusClosed,
        ]}
      >
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>
          {isActive ? "Alerte active" : isExpired ? "Expirée" : "Clôturée"}
        </Text>
      </View>
    </View>
  );
}
