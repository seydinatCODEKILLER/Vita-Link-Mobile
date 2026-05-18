import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "@/src/types/alert.types";
import { getTimeRemaining } from "@/src/utils/format.utils";
import * as Haptics from "expo-haptics";
import { useIsEligible } from "@/src/hooks/useAuthStore";

// ─── Palette ──────────────────────────────────────────────────
const COLORS = {
  cardBg: "#111111",
  cardBorder: "rgba(255,255,255,0.08)",
  red: "#DC1E1E",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.45)",
  textSubtle: "rgba(255,255,255,0.20)",
  standardGreen: "#1D9E75",
  amber: "#FAC775",
} as const;

// ─── Mapping labels ────────────────────────────────────────────
const SERVICE_LABELS: Record<string, string> = {
  EMERGENCY_ROOM: "Urgences",
  OPERATING_ROOM: "Bloc opératoire",
  MATERNITY: "Maternité",
  GENERAL: "Service général",
  PEDIATRICS: "Pédiatrie",
};

const BLOOD_TYPE_LABELS: Record<string, string> = {
  A_POS: "A+",
  A_NEG: "A−",
  B_POS: "B+",
  B_NEG: "B−",
  AB_POS: "AB+",
  AB_NEG: "AB−",
  O_POS: "O+",
  O_NEG: "O−",
};

// ─── Quota progress bar ────────────────────────────────────────
function QuotaBar({
  confirmed,
  needed,
  isVital,
}: {
  confirmed: number;
  needed: number;
  isVital: boolean;
}) {
  const pct = Math.min((confirmed / needed) * 100, 100);
  return (
    <View style={styles.quotaRow}>
      <View style={styles.quotaBarBg}>
        <View
          style={[
            styles.quotaBarFill,
            {
              width: `${pct}%` as any,
              backgroundColor: isVital ? COLORS.red : COLORS.standardGreen,
            },
          ]}
        />
      </View>
      <Text style={styles.quotaText}>
        {confirmed}/{needed} poches
      </Text>
    </View>
  );
}

// ─── Composant principal ───────────────────────────────────────
interface AlertCardProps {
  alert: Alert;
  onPress: (alertId: string) => void;
  onConfirm: (alertId: string) => void;
}

export const AlertCard = ({ alert, onPress, onConfirm }: AlertCardProps) => {
  const isVital = alert.urgencyLevel === "VITAL";
  const { isEligible, daysLeft } = useIsEligible();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  // Pulsation pour VITAL
  useEffect(() => {
    if (!isVital) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.015,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 900,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.2,
          duration: 900,
          useNativeDriver: false,
        }),
      ]),
    );
    pulse.start();
    glow.start();
    return () => {
      pulse.stop();
      glow.stop();
    };
  }, [isVital]);

  const handleRelay = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `🚨 URGENCE : L'hôpital ${alert.healthStructure.name} a besoin de sang ${bloodLabel} ! Si tu es disponible et éligible, télécharge Vita-Link ou rends-y toi.`,
      });
    } catch (error) {
      // Silencieux
    }
  };

  const timeRemaining = getTimeRemaining(alert.expiresAt);
  const serviceLabel = SERVICE_LABELS[alert.serviceUnit] ?? alert.serviceUnit;
  const bloodLabel = BLOOD_TYPE_LABELS[alert.bloodType] ?? alert.bloodType;
  const isRare = alert.bloodType === "O_NEG" || alert.bloodType === "AB_NEG";
  const distanceText =
    alert.distance_km != null ? `${alert.distance_km} km` : "— km";

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
          !isEligible && styles.cardIneligible,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        {/* ── Bande top VITAL ── */}
        {isVital && (
          <View style={styles.vitalBand}>
            <View style={styles.vitalDot} />
            <Text style={styles.vitalBandText}>URGENCE VITALE</Text>
          </View>
        )}

        {/* ── Corps principal ── */}
        <View style={styles.body}>
          {/* Colonne gauche : groupe sanguin */}
          <View style={[styles.bloodBadge, isVital && styles.bloodBadgeVital]}>
            <Text style={[styles.bloodText, isVital && styles.bloodTextVital]}>
              {bloodLabel}
            </Text>
            {isRare && (
              <View style={styles.rareBadge}>
                <Text style={styles.rareText}>Rare</Text>
              </View>
            )}
          </View>

          {/* Colonne droite : infos */}
          <View style={styles.infoBlock}>
            {/* Nom hôpital + badge urgence */}
            <View style={styles.infoTop}>
              <Text style={styles.hospitalName} numberOfLines={1}>
                {alert.healthStructure.name}
              </Text>
              <View
                style={[
                  styles.urgencyBadge,
                  isVital ? styles.urgencyBadgeVital : styles.urgencyBadgeStd,
                ]}
              >
                <Text
                  style={[
                    styles.urgencyText,
                    isVital ? styles.urgencyTextVital : styles.urgencyTextStd,
                  ]}
                >
                  {isVital ? "VITAL" : "STD"}
                </Text>
              </View>
            </View>

            {/* Service + Distance */}
            <View style={styles.metaRow}>
              <Ionicons
                name="medkit-outline"
                size={12}
                color={COLORS.textMuted}
              />
              <Text style={styles.metaText}>{serviceLabel}</Text>
              <View style={styles.dot} />
              <Ionicons
                name="location-outline"
                size={12}
                color={COLORS.textMuted}
              />
              <Text style={styles.metaText}>{distanceText}</Text>
            </View>

            {/* Quota bar */}
            <QuotaBar
              confirmed={alert.quantityConfirmed}
              needed={alert.quantityNeeded}
              isVital={isVital}
            />
          </View>
        </View>

        {/* ── Footer : timer + CTA ── */}
        <View style={styles.footer}>
          <View style={styles.timerBlock}>
            <Ionicons
              name="time-outline"
              size={13}
              color={isVital ? COLORS.red : COLORS.textMuted}
            />
            <Text style={[styles.timerText, isVital && styles.timerTextVital]}>
              {timeRemaining}
            </Text>
          </View>

          {/* ✅ NOUVEAU : Logique de bouton conditionnelle */}
          {isEligible ? (
            // CAS 1 : Éligible -> Bouton normal "J'y vais"
            <TouchableOpacity
              style={[styles.ctaBtn, isVital && styles.ctaBtnVital]}
              onPress={(e) => {
                e.stopPropagation();
                onConfirm(alert.id);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="heart" size={13} color={COLORS.white} />
              <Text style={styles.ctaBtnText}>J&apos;y vais</Text>
            </TouchableOpacity>
          ) : (
            // CAS 2 : Inéligible -> Bouton "Relayer"
            <TouchableOpacity
              style={styles.relayBtn}
              onPress={(e) => {
                e.stopPropagation();
                handleRelay();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="share-outline" size={13} color={COLORS.amber} />
              <Text style={styles.relayBtnText}>Relayer</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  touchable: { marginBottom: 12 },

  cardIneligible: {
    opacity: 0.6,
  },
  relayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(250,199,117,0.15)",
    borderWidth: 1,
    borderColor: "rgba(250,199,117,0.30)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  relayBtnText: {
    color: COLORS.amber,
    fontSize: 13,
    fontWeight: "700",
  },

  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    overflow: "hidden",
  },
  cardVital: {
    borderColor: "rgba(220,30,30,0.35)",
    backgroundColor: "rgba(220,30,30,0.04)",
  },

  // ── Bande VITAL ──
  vitalBand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(220,30,30,0.14)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(220,30,30,0.18)",
  },
  vitalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.red,
  },
  vitalBandText: {
    color: COLORS.red,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  // ── Corps ──
  body: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    paddingBottom: 10,
  },

  // Badge groupe sanguin
  bloodBadge: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: "rgba(220,30,30,0.10)",
    borderWidth: 1.5,
    borderColor: "rgba(220,30,30,0.25)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    position: "relative",
  },
  bloodBadgeVital: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
  },
  bloodText: {
    color: COLORS.red,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  bloodTextVital: {
    color: COLORS.white,
  },
  rareBadge: {
    position: "absolute",
    bottom: -6,
    backgroundColor: "rgba(250,199,117,0.20)",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  rareText: {
    color: COLORS.amber,
    fontSize: 8,
    fontWeight: "700",
  },

  // Bloc info
  infoBlock: { flex: 1, gap: 6 },
  infoTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  hospitalName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  urgencyBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  urgencyBadgeVital: {
    backgroundColor: "rgba(220,30,30,0.15)",
    borderColor: "rgba(220,30,30,0.35)",
  },
  urgencyBadgeStd: {
    backgroundColor: "rgba(29,158,117,0.12)",
    borderColor: "rgba(29,158,117,0.28)",
  },
  urgencyText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  urgencyTextVital: { color: COLORS.red },
  urgencyTextStd: { color: COLORS.standardGreen },

  // Meta row
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: { color: COLORS.textMuted, fontSize: 11 },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.textSubtle,
    marginHorizontal: 2,
  },

  // Quota
  quotaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quotaBarBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  quotaBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  quotaText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "600",
    flexShrink: 0,
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  timerBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
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
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(220,30,30,0.85)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  ctaBtnVital: {
    backgroundColor: COLORS.red,
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },
});
