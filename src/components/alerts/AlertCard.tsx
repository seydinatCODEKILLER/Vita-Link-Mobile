import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated, Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "@/src/types/alert.types";
import { getTimeRemaining } from "@/src/utils/format.utils";
import * as Haptics from "expo-haptics";
import { useIsEligible } from "@/src/hooks/useAuthStore";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { AppColors } from "@/src/theme/colors";

// Couleurs sémantiques fixes — indépendantes du thème
const STANDARD_GREEN = "#1D9E75";

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

// ─── QuotaBar ──────────────────────────────────────────────────
function QuotaBar({
  confirmed,
  needed,
  isVital,
  colors,
}: {
  confirmed: number;
  needed: number;
  isVital: boolean;
  colors: AppColors;
}) {
  const pct = Math.min((confirmed / needed) * 100, 100);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View
        style={{
          flex: 1,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.cardBorder,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${pct}%` as any,
            height: "100%",
            borderRadius: 2,
            backgroundColor: isVital ? colors.red : STANDARD_GREEN,
          }}
        />
      </View>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: 10,
          fontWeight: "600",
          flexShrink: 0,
        }}
      >
        {confirmed}/{needed} poches
      </Text>
    </View>
  );
}

// ─── AlertCard ─────────────────────────────────────────────────
interface AlertCardProps {
  alert: Alert;
  onPress: (alertId: string) => void;
  onConfirm: (alertId: string) => void;
}

export const AlertCard = ({ alert, onPress, onConfirm }: AlertCardProps) => {
  const colors = useColors();
  const isVital = alert.urgencyLevel === "VITAL";
  const { isEligible } = useIsEligible();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  // 🆕 Logique d'origine de l'alerte (CNTS vs Hôpital)
  const isCntsAlert =
    alert.origin === "CNTS_DIRECT" || alert.origin === "CNTS_ESCALATION";

  // 🆕 Détermination dynamique du nom à afficher
  const displayStructureName = isCntsAlert
    ? `🩸 ${alert.healthStructure.name}`
    : alert.healthStructure.name;

  // 🆕 Détermination dynamique du label du bouton
  const ctaLabel = isCntsAlert ? "Je me rends au CNTS" : "J'y vais";

  const styles = useThemedStyles((c) => ({
    touchable: { marginBottom: 12 },

    card: {
      backgroundColor: c.cardBg,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: c.cardBorder,
      overflow: "hidden",
    },
    cardVital: {
      borderColor: "rgba(220,30,30,0.35)",
      backgroundColor: "rgba(220,30,30,0.04)",
    },
    cardIneligible: { opacity: 0.6 },

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
      backgroundColor: c.red,
    },
    vitalBandText: {
      color: c.red,
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
    bloodBadgeVital: { backgroundColor: c.red, borderColor: c.red },
    bloodText: {
      color: c.red,
      fontSize: 20,
      fontWeight: "900",
      letterSpacing: -0.5,
    },
    bloodTextVital: { color: "#FFFFFF" },
    rareBadge: {
      position: "absolute",
      bottom: -6,
      backgroundColor: c.amber + "33",
      borderRadius: 4,
      paddingHorizontal: 4,
      paddingVertical: 1,
    },
    rareText: { color: c.amber, fontSize: 8, fontWeight: "700" },

    // Bloc info
    infoBlock: { flex: 1, gap: 6 },
    infoTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    hospitalName: { color: c.white, fontSize: 14, fontWeight: "700", flex: 1 },
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
    urgencyTextVital: { color: c.red },
    urgencyTextStd: { color: STANDARD_GREEN },

    // Meta row
    metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    metaText: { color: c.textMuted, fontSize: 11 },
    dot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: c.textSubtle,
      marginHorizontal: 2,
    },

    // Footer
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: c.cardBorder,
    },
    timerBlock: { flexDirection: "row", alignItems: "center", gap: 5 },
    timerText: { color: c.textMuted, fontSize: 12, fontWeight: "500" },
    timerTextVital: { color: c.red, fontWeight: "700" },

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
      backgroundColor: c.red,
      shadowColor: c.red,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 6,
    },
    ctaBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },

    relayBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: c.amber + "26",
      borderWidth: 1,
      borderColor: c.amber + "4D",
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 10,
    },
    relayBtnText: { color: c.amber, fontSize: 13, fontWeight: "700" },
  }));

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
    // 🆕 Amélioration du message de partage selon l'origine
    const urgencyText = isVital ? "🚨 URGENCE VITALE" : "🩸 Appel aux donneurs";
    const locationText = isCntsAlert
      ? `au ${alert.healthStructure.name}`
      : `à l'hôpital ${alert.healthStructure.name}`;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `${urgencyText} : On a besoin de donneurs ${locationText} pour du sang ${bloodLabel} ! Si tu es disponible et éligible, télécharge Vita-Link ou rends-y toi.`,
      });
    } catch {
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
            {/* 🆕 On précise si c'est une urgence hôpital ou pénurie CNTS */}
            <Text style={styles.vitalBandText}>
              {isCntsAlert ? "PÉNURIE CRITIQUE CNTS" : "URGENCE VITALE"}
            </Text>
          </View>
        )}

        {/* ── Corps principal ── */}
        <View style={styles.body}>
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

          <View style={styles.infoBlock}>
            <View style={styles.infoTop}>
              <Text style={styles.hospitalName} numberOfLines={1}>
                {/* 🆕 Nom dynamique */}
                {displayStructureName}
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

            <View style={styles.metaRow}>
              {/* 🆕 Icône dynamique : Médical pour hôpital, Goutte pour CNTS */}
              <Ionicons
                name={isCntsAlert ? "water-outline" : "medkit-outline"}
                size={12}
                color={colors.textMuted}
              />
              <Text style={styles.metaText}>
                {/* 🆕 Si c'est le CNTS, on affiche "Centre de collecte" au lieu du service médical */}
                {isCntsAlert ? "Centre de collecte" : serviceLabel}
              </Text>
              <View style={styles.dot} />
              <Ionicons
                name="location-outline"
                size={12}
                color={colors.textMuted}
              />
              <Text style={styles.metaText}>{distanceText}</Text>
            </View>

            <QuotaBar
              confirmed={alert.quantityConfirmed}
              needed={alert.quantityNeeded}
              isVital={isVital}
              colors={colors}
            />
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <View style={styles.timerBlock}>
            <Ionicons
              name="time-outline"
              size={13}
              color={isVital ? colors.red : colors.textMuted}
            />
            <Text style={[styles.timerText, isVital && styles.timerTextVital]}>
              {timeRemaining}
            </Text>
          </View>

          {isEligible ? (
            <TouchableOpacity
              style={[styles.ctaBtn, isVital && styles.ctaBtnVital]}
              onPress={(e) => {
                e.stopPropagation();
                onConfirm(alert.id);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="heart" size={13} color="#FFFFFF" />
              {/* 🆕 Label dynamique */}
              <Text style={styles.ctaBtnText}>{ctaLabel}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.relayBtn}
              onPress={(e) => {
                e.stopPropagation();
                handleRelay();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="share-outline" size={13} color={colors.amber} />
              <Text style={styles.relayBtnText}>Relayer</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};
