import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "@/src/types/alert.types";
import { getTimeRemaining } from "@/src/utils/format.utils";

const COLORS = {
  cardBg: "rgba(255,255,255,0.05)",
  cardBorder: "rgba(255,255,255,0.09)",
  red: "#DC1E1E",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.50)",
  standardGreen: "#1D9E75",
};

// Mapping des unités de service pour l'affichage
const SERVICE_LABELS: Record<string, string> = {
  EMERGENCY_ROOM: "Salle d'urgence",
  OPERATING_ROOM: "Bloc opératoire",
  MATERNITY: "Maternité",
  GENERAL: "Service général",
  PEDIATRICS: "Pédiatrie",
};

interface AlertCardProps {
  alert: Alert;
  onPress: (alertId: string) => void;
  onConfirm: (alertId: string) => void;
}

export const AlertCard = ({ alert, onPress, onConfirm }: AlertCardProps) => {
  const isVital = alert.urgencyLevel === "VITAL";
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isVital) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [isVital]);

  const timeRemaining = getTimeRemaining(alert.expiresAt);
  const serviceLabel = SERVICE_LABELS[alert.serviceUnit] || alert.serviceUnit;

  return (
    <TouchableOpacity
      onPress={() => onPress(alert.id)}
      activeOpacity={0.85}
      style={styles.touchable}
    >
      <Animated.View
        style={[
          styles.card,
          isVital && styles.cardVital,
          isVital && { transform: [{ scale: pulseAnim }] },
        ]}
      >
        {/* ── Ligne 1 : Hôpital + Badge ── */}
        <View style={styles.row1}>
          <Text style={styles.hospitalName} numberOfLines={1}>
            {alert.healthStructure.name}
          </Text>
          <View
            style={[
              styles.badge,
              isVital ? styles.badgeVital : styles.badgeStandard,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isVital ? styles.badgeTextVital : styles.badgeTextStandard,
              ]}
            >
              {isVital ? "VITAL" : "STANDARD"}
            </Text>
          </View>
        </View>

        {/* ── Ligne 2 : Détails (Distance, Service, Poche) ── */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons
              name="location-outline"
              size={14}
              color={COLORS.textMuted}
            />
            <Text style={styles.detailText}>{alert.distance_km ?? "?"} km</Text>
          </View>
          <View style={styles.detailSeparator} />
          <View style={styles.detailItem}>
            <Ionicons
              name="medkit-outline"
              size={14}
              color={COLORS.textMuted}
            />
            <Text style={styles.detailText}>{serviceLabel}</Text>
          </View>
          <View style={styles.detailSeparator} />
          <View style={styles.detailItem}>
            <Ionicons name="water-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.detailText}>
              {alert.quantityNeeded} poches requises
            </Text>
          </View>
        </View>

        {/* ── Ligne 3 : Timer + Bouton Action ── */}
        <View style={styles.row3}>
          <View style={styles.timerBlock}>
            <Ionicons
              name="time-outline"
              size={14}
              color={isVital ? COLORS.red : COLORS.textMuted}
            />
            <Text style={[styles.timerText, isVital && styles.timerTextVital]}>
              {timeRemaining}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onConfirm(alert.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnText}>J&apos;y vais</Text>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={COLORS.white}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: { marginBottom: 14 },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
  },
  cardVital: {
    borderColor: "rgba(220,30,30,0.30)",
    backgroundColor: "rgba(220,30,30,0.05)",
  },
  row1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  hospitalName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeVital: { backgroundColor: "rgba(220,30,30,0.15)" },
  badgeStandard: { backgroundColor: "rgba(29,158,117,0.12)" },
  badgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  badgeTextVital: { color: COLORS.red },
  badgeTextStandard: { color: COLORS.standardGreen },

  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  detailSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255,255,255,0.20)",
    marginHorizontal: 8,
  },

  row3: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timerBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
  timerTextVital: {
    color: COLORS.red,
    fontWeight: "700",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.red,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  actionBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },
});
