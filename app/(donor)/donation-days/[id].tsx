import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import {
  useDayDetail,
  useRegisterDonor,
  useCancelDonorRegistration,
} from "@/src/hooks/useDonationDays";
import { useIsEligible } from "@/src/hooks/useAuthStore";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen"; // ✅ Ajouté
import { isNetworkError } from "@/src/utils/error.utils"; // ✅ Ajouté

dayjs.locale("fr");

// ─── Écran Principal ──────────────────────────────────────────
export default function DonorDayDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const tabBarHeight = useBottomTabBarHeight();

  // ✅ Ajout de isError et error
  const { data: day, isLoading, isError, error, refetch } = useDayDetail(id);
  const { mutateAsync: register, isPending: isRegistering } =
    useRegisterDonor();
  const { mutateAsync: cancelReg, isPending: isCancelling } =
    useCancelDonorRegistration();

  const { isEligible, daysLeft } = useIsEligible();
  const [isRegistered, setIsRegistered] = useState(false);

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    safeArea: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 12,
      gap: 12,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: c.cardBg,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: { color: c.white, fontSize: 16, fontWeight: "700", flex: 1 },
    cover: { height: 200, backgroundColor: c.red + "05" },
    coverImage: { width: "100%", height: "100%" },
    body: { padding: 20, gap: 20 },
    structureRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: c.cardBg,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    structureIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: c.red + "12",
      alignItems: "center",
      justifyContent: "center",
    },
    structureName: { color: c.white, fontSize: 15, fontWeight: "600" },
    structureAddress: { color: c.textMuted, fontSize: 12, marginTop: 2 },
    title: {
      color: c.white,
      fontSize: 24,
      fontWeight: "800",
      letterSpacing: -0.5,
      lineHeight: 30,
    },
    metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    metaCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: c.cardBg,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    metaText: { color: c.textMuted, fontSize: 13, fontWeight: "500" },
    bloodRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
    pill: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: c.red + "08",
      borderWidth: 1,
      borderColor: c.red + "20",
    },
    pillText: { color: c.red, fontSize: 11, fontWeight: "700" },
    emptyPill: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: c.cardBorder + "15",
      borderWidth: 1,
      borderColor: c.cardBorder + "25",
    },
    emptyPillText: { color: c.textMuted, fontSize: 11, fontWeight: "600" },
    statsRow: { flexDirection: "row", gap: 10 },
    statCard: {
      flex: 1,
      backgroundColor: c.cardBg,
      borderRadius: 14,
      padding: 14,
      alignItems: "center",
      gap: 4,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    statValue: { fontSize: 20, fontWeight: "800", color: c.white },
    statLabel: { fontSize: 11, color: c.textMuted, fontWeight: "500" },
    eligibilityBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: c.amber + "10",
      borderWidth: 1.5,
      borderColor: c.amber + "35",
      borderRadius: 14,
      padding: 14,
    },
    eligibilityText: {
      color: c.amber,
      fontSize: 13,
      fontWeight: "600",
      flex: 1,
      lineHeight: 18,
    },
    description: { color: c.textMuted, fontSize: 14, lineHeight: 22 },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 10 + tabBarHeight,
      backgroundColor: c.bg + "EE",
    },
    ctaBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: c.red,
      borderRadius: 16,
      paddingVertical: 17,
    },
    ctaBtnDisabled: { opacity: 0.5 },
    ctaBtnText: { color: c.white, fontSize: 16, fontWeight: "700" },
    cancelBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.red + "40",
    },
    cancelBtnText: { color: c.red, fontSize: 14, fontWeight: "600" },
  }));

  const handleRegister = async () => {
    try {
      await register(id);
      setIsRegistered(true);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        "Impossible de s'inscrire pour le moment.";
      Alert.alert("Inscription impossible", msg);
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      "Annuler mon inscription",
      "Êtes-vous sûr ? Cette action est irréversible si l'événement a lieu dans moins de 24h.",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui, annuler",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelReg(id);
              setIsRegistered(false);
            } catch (error: any) {
              const msg =
                error?.response?.data?.message || "Annulation impossible.";
              Alert.alert("Erreur", msg);
            }
          },
        },
      ],
    );
  };

  // ── 1. Loading initial ─────────────────────────────────────────
  if (isLoading && !day) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={[styles.header, { justifyContent: "center" }]}>
          <ActivityIndicator color={colors.red} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  // ── 2. Erreur réseau sans cache (Comportement hors-ligne) ──────
  if (isError && !day && isNetworkError(error)) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Détail de la collecte
          </Text>
        </View>
        <NetworkErrorScreen onRetry={refetch} />
      </SafeAreaView>
    );
  }

  // ── 3. Sécurité si données manquantes (autre erreur) ───────────
  if (!day) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Introuvable
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Ionicons
            name="calendar-outline"
            size={48}
            color={colors.textMuted}
          />
          <Text
            style={{
              color: colors.white,
              fontSize: 18,
              fontWeight: "700",
              marginTop: 16,
              textAlign: "center",
            }}
          >
            Cette collecte n&apos;existe pas ou a été supprimée.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── 4. Rendu normal (ou avec cache périmé si offline) ──────────
  const registrationsCount = day._count?.registrations ?? 0;
  const remainingSpots = Math.max(0, day.targetDonors - registrationsCount);
  const isFull = remainingSpots === 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 100 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Détail de la collecte
          </Text>
        </View>

        {/* Cover */}
        <View style={styles.cover}>
          {day.photoUrl ? (
            <Image
              source={{ uri: day.photoUrl }}
              style={styles.coverImage}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="calendar-outline"
                size={60}
                color={colors.red + "15"}
              />
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* Structure */}
          <View style={styles.structureRow}>
            <View style={styles.structureIcon}>
              <Ionicons name="business-outline" size={20} color={colors.red} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.structureName}>
                {day.healthStructure?.name}
              </Text>
              <Text style={styles.structureAddress} numberOfLines={1}>
                {day.address}
              </Text>
            </View>
          </View>

          {/* Titre & Desc */}
          <Text style={styles.title}>{day.title}</Text>
          {day.description ? (
            <Text style={styles.description}>{day.description}</Text>
          ) : null}

          {/* Meta */}
          <View style={styles.metaGrid}>
            <View style={styles.metaCard}>
              <Ionicons name="calendar-outline" size={16} color={colors.red} />
              <Text style={styles.metaText}>
                {dayjs(day.scheduledDate).format("DD MMMM YYYY")}
              </Text>
            </View>
            <View style={styles.metaCard}>
              <Ionicons name="time-outline" size={16} color={colors.red} />
              <Text style={styles.metaText}>
                {day.startTime} – {day.endTime}
              </Text>
            </View>
          </View>

          {/* Blood Types */}
          <View style={styles.bloodRow}>
            {day.bloodTypesNeeded.length === 0 ? (
              <View style={styles.emptyPill}>
                <Text style={styles.emptyPillText}>
                  Ouvert à tous les groupes
                </Text>
              </View>
            ) : (
              day.bloodTypesNeeded.map((bt) => (
                <View key={bt} style={styles.pill}>
                  <Text style={styles.pillText}>
                    {bt.replace("_POS", "+").replace("_NEG", "−")}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.red }]}>
                {remainingSpots}
              </Text>
              <Text style={styles.statLabel}>Places restantes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {registrationsCount}
              </Text>
              <Text style={styles.statLabel}>Inscrits</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.amber }]}>
                {day.targetDonors}
              </Text>
              <Text style={styles.statLabel}>Objectif</Text>
            </View>
          </View>

          {/* Eligibilité Banner */}
          {!isEligible && (
            <View style={styles.eligibilityBanner}>
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color={colors.amber}
              />
              <Text style={styles.eligibilityText}>
                Période de repos en cours. Vous pourrez donner dans {daysLeft}{" "}
                jour{daysLeft > 1 ? "s" : ""}.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        {isRegistered ? (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            disabled={isCancelling}
            activeOpacity={0.7}
          >
            {isCancelling ? (
              <ActivityIndicator color={colors.red} size="small" />
            ) : (
              <>
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color={colors.red}
                />
                <Text style={styles.cancelBtnText}>
                  Annuler mon inscription
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.ctaBtn,
              (isFull || !isEligible || isRegistering) && styles.ctaBtnDisabled,
            ]}
            onPress={handleRegister}
            disabled={isFull || !isEligible || isRegistering}
            activeOpacity={0.85}
          >
            {isRegistering ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.ctaBtnText}>
                  {isFull
                    ? "Liste d'attente complète"
                    : !isEligible
                      ? "Non éligible pour le moment"
                      : "S'inscrire à cette collecte"}
                </Text>
                {isFull || !isEligible ? null : (
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      backgroundColor: "rgba(255,255,255,0.18)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="checkmark-outline" size={17} color="#fff" />
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
