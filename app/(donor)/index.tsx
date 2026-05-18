import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
  Animated,
  Alert,
} from "react-native";
import { Href, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/src/store/auth.store";
import {
  useActiveEngagement,
  useCancelConfirmation,
  useNearbyAlerts,
} from "@/src/hooks/useAlerts";
import { useUpdateAvailability } from "@/src/hooks/useAvailability";
import { AlertCard } from "@/src/components/alerts/AlertCard";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { ActiveEngagement, Alert as AlertType } from "@/src/types/alert.types";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";
import { getPendingQr, PendingQr } from "@/src/utils/qr.utils";

// ─── Palette ──────────────────────────────────────────────────
const COLORS = {
  bg: "#080808",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.45)",
  textSubtle: "rgba(255,255,255,0.18)",
  red: "#DC1E1E",
  green: "#1D9E75",
  amber: "#FAC775", // ✅ AJOUTÉ pour le mode expiré
  cardBg: "rgba(255,255,255,0.05)",
  cardBorder: "rgba(255,255,255,0.08)",
} as const;

type FilterType = "ALL" | "VITAL" | "STANDARD";

const FILTERS: { key: FilterType; label: string; icon?: string }[] = [
  { key: "ALL", label: "Toutes" },
  { key: "VITAL", label: "Vital" },
  { key: "STANDARD", label: "Standard" },
];

// ─── Skeleton card ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonRow}>
        <View style={styles.skeletonBlood} />
        <View style={styles.skeletonInfo}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: "60%", opacity: 0.4 }]} />
          <View style={[styles.skeletonLine, { width: "80%", opacity: 0.3 }]} />
        </View>
      </View>
      <View style={styles.skeletonFooter} />
    </View>
  );
}

// ─── Composant stats rapides ───────────────────────────────────
function AlertsStats({ total, vital }: { total: number; vital: number }) {
  if (total === 0) return null;
  return (
    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{total}</Text>
        <Text style={styles.statLabel}>alerte{total > 1 ? "s" : ""}</Text>
      </View>
      <View style={styles.statDivider} />
      {vital > 0 ? (
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.red }]}>{vital}</Text>
          <Text style={styles.statLabel}>vitale{vital > 1 ? "s" : ""}</Text>
        </View>
      ) : (
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.green }]}>0</Text>
          <Text style={styles.statLabel}>vitales</Text>
        </View>
      )}
    </View>
  );
}

// ─── Bannière Engagement Actif ─────────────────────────────────
function EngagementBanner({
  engagement,
  isExpired = false,
  onPress,
}: {
  engagement: ActiveEngagement | PendingQr;
  isExpired?: boolean;
  onPress: () => void;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
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
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Détermination des données selon le type d'engagement
  const isLocalQr = "hospitalName" in engagement; // PendingQr a hospitalName directement
  const hospitalName = isLocalQr
    ? (engagement as PendingQr).hospitalName
    : (engagement as ActiveEngagement).alert.healthStructure.name;

  const bloodLabel = isLocalQr
    ? (engagement as PendingQr).bloodType
    : (BLOOD_TYPE_LABELS[(engagement as ActiveEngagement).alert.bloodType] ??
      (engagement as ActiveEngagement).alert.bloodType.replace("_", ""));

  // ✅ Couleur dynamique selon l'expiration
  const accentColor = isExpired ? COLORS.amber : COLORS.red;

  return (
    <Animated.View
      style={[styles.engagementWrapper, { transform: [{ scale: pulseAnim }] }]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[
          styles.engagementRow,
          {
            borderColor: accentColor + "30",
            backgroundColor: accentColor + "07",
          },
        ]}
      >
        {/* Bande accent en haut */}
        <View
          style={[styles.engagementAccentBar, { backgroundColor: accentColor }]}
        />

        <View style={styles.engagementInner}>
          {/* Icône QR + badge LIVE / RETARD */}
          <View style={styles.engagementIconContainer}>
            <View
              style={[
                styles.engagementIconWrap,
                { backgroundColor: accentColor },
              ]}
            >
              <Ionicons name="qr-code-outline" size={26} color={COLORS.white} />
            </View>
            <View
              style={[
                styles.liveBadge,
                { backgroundColor: isExpired ? COLORS.amber : COLORS.green },
              ]}
            >
              <Text style={styles.liveBadgeText}>
                {isExpired ? "RETARD" : "LIVE"}
              </Text>
            </View>
          </View>

          {/* Bloc texte */}
          <View style={styles.engagementTextBlock}>
            <View style={styles.engagementTitleRow}>
              <Text style={[styles.engagementTitle, { color: accentColor }]}>
                {isExpired ? "Retard — Pass Classique" : "Vous êtes attendu !"}
              </Text>
              <View
                style={[styles.engagementDot, { backgroundColor: accentColor }]}
              />
            </View>
            <Text style={styles.engagementSub} numberOfLines={1}>
              {hospitalName} • {bloodLabel}
            </Text>
          </View>

          {/* Chevron */}
          <View style={styles.engagementArrow}>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="rgba(255,255,255,0.60)"
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function DonorHomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const {
    data: alerts,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useNearbyAlerts();
  const { mutate: toggleAvailability, isPending: isTogglingAvail } =
    useUpdateAvailability();
  const { data: activeEngagement } = useActiveEngagement();
  const { mutateAsync: cancelConfirmation } = useCancelConfirmation();

  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [localQr, setLocalQr] = useState<PendingQr | null>(null);
  const [isLocalExpired, setIsLocalExpired] = useState(false);

  useEffect(() => {
    const loadLocalQr = async () => {
      const qr = await getPendingQr();
      if (qr) {
        setLocalQr(qr);
        setIsLocalExpired(false);
      } else {
        setLocalQr(null);
        // ✅ CORRECTION : On ajoute 2 gardes fous
        // 1. activeEngagement doit exister
        // 2. L'alerte doit avoir un ID valide
        // 3. L'engagement doit appartenir à l'utilisateur actuel
        if (
          activeEngagement &&
          activeEngagement.alert &&
          activeEngagement.alert.id &&
          user?.id
        ) {
          setIsLocalExpired(true);
        } else {
          setIsLocalExpired(false);
        }
      }
    };
    loadLocalQr();
  }, [activeEngagement, user?.id]);

  // Déterminer ce qu'on affiche : L'engagement API en priorité, sinon le local
  const displayedEngagement = activeEngagement
    ? { type: "active" as const, data: activeEngagement }
    : localQr
      ? { type: "expired" as const, data: localQr }
      : null;

  // Filtrage côté client
  const filteredAlerts: AlertType[] =
    alerts?.filter((a) => {
      if (activeFilter === "ALL") return true;
      return a.urgencyLevel === activeFilter;
    }) ?? [];

  const handleOpenQrCode = useCallback(
    (qrCode: string, alertId: string, isExpired: boolean) =>
      router.push({
        pathname: "/(donor)/qrcode" as any,
        params: { qrCode, alertId, isExpired: isExpired ? "true" : "false" },
      }),
    [router],
  );

  const vitalCount =
    alerts?.filter((a) => a.urgencyLevel === "VITAL").length ?? 0;

  const handleAlertPress = useCallback(
    (alertId: string) => router.push(`/(donor)/alerts/${alertId}` as Href),
    [router],
  );

  const handleCancelDirect = async (alertId: string) => {
    Alert.alert(
      "Annuler cet engagement ?",
      "Votre pass a expiré. Si vous n'êtes pas à l'hôpital, annulez pour redevenir disponible.",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui, annuler",
          style: "destructive",
          onPress: async () => {
            await cancelConfirmation(alertId);
            setIsLocalExpired(false);
          },
        },
      ],
    );
  };

  const handleQuickConfirm = useCallback(
    (alertId: string) => router.push(`/(donor)/alerts/${alertId}` as Href),
    [router],
  );

  // ── Loading skeleton ──
  if (isLoading && !alerts) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour {user?.firstName} 👋</Text>
            <Text style={styles.headerTitle}>
              Alertes <Text style={{ color: COLORS.red }}>proches</Text>
            </Text>
          </View>
        </View>
        <View style={styles.listContent}>
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={filteredAlerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlertCard
            alert={item}
            onPress={handleAlertPress}
            onConfirm={handleQuickConfirm}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isRefetching}
        // ── Header de la liste ──
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <View style={{ gap: 3 }}>
                <Text style={styles.greeting}>
                  Bonjour {user?.firstName} 👋
                </Text>
                <Text style={styles.headerTitle}>
                  Alertes <Text style={{ color: COLORS.red }}>proches</Text>
                </Text>
              </View>

              {/* Cloche avec badge */}
              <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
                <Ionicons
                  name="notifications-outline"
                  size={21}
                  color={COLORS.white}
                />
                {vitalCount > 0 && (
                  <View style={styles.bellBadge}>
                    <Text style={styles.bellBadgeText}>{vitalCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Toggle disponibilité */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.availRow,
                user?.isAvailable ? styles.availRowOn : styles.availRowOff,
              ]}
              onPress={() => toggleAvailability(!user?.isAvailable)}
              disabled={isTogglingAvail}
            >
              <View style={styles.availLeft}>
                <View
                  style={[
                    styles.availDot,
                    user?.isAvailable ? styles.availDotOn : styles.availDotOff,
                  ]}
                />
                <View>
                  <Text style={styles.availTitle}>
                    {user?.isAvailable
                      ? "Disponible pour donner"
                      : "Non disponible"}
                  </Text>
                  <Text style={styles.availSub}>
                    {user?.isAvailable
                      ? "Vous recevez les alertes push"
                      : "Les alertes sont suspendues"}
                  </Text>
                </View>
              </View>
              <Switch
                trackColor={{
                  false: "rgba(255,255,255,0.10)",
                  true: COLORS.green,
                }}
                thumbColor={COLORS.white}
                value={user?.isAvailable ?? true}
                onValueChange={(val) => toggleAvailability(val)}
                disabled={isTogglingAvail}
              />
            </TouchableOpacity>

            {/* ✅ Bannière Engagement Actif / Expiré (On ne l'affiche PAS si le fantôme est là) */}
            {displayedEngagement && !isLocalExpired && (
              <EngagementBanner
                engagement={displayedEngagement.data}
                isExpired={displayedEngagement.type === "expired"}
                onPress={() => {
                  const alertId =
                    displayedEngagement.type === "active"
                      ? (displayedEngagement.data as ActiveEngagement).alert.id
                      : (displayedEngagement.data as PendingQr).alertId;

                  handleOpenQrCode(
                    displayedEngagement.data.qrCode,
                    alertId,
                    displayedEngagement.type === "expired",
                  );
                }}
              />
            )}

            {/* ✅ Bannière Fantôme (Prioritaire si le QR local a expiré mais backend toujours bloquant) */}
            {isLocalExpired &&
              activeEngagement &&
              activeEngagement.alert?.id && (
                <View style={styles.ghostBanner}>
                  <View style={styles.ghostTextBlock}>
                    <Text style={styles.ghostTitle}>Engagement non validé</Text>
                    <Text style={styles.ghostSub}>
                      Votre pass a expiré. Annulez pour redevenir disponible.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.ghostCancelBtn}
                    onPress={() =>
                      handleCancelDirect(activeEngagement.alert.id)
                    }
                  >
                    <Text style={styles.ghostCancelText}>Libérer</Text>
                  </TouchableOpacity>
                </View>
              )}

            {/* Stats */}
            <AlertsStats total={alerts?.length ?? 0} vital={vitalCount} />

            {/* Filtres */}
            <View style={styles.filtersRow}>
              {FILTERS.map((f) => {
                const isActive = activeFilter === f.key;
                const isVitalFilter = f.key === "VITAL";
                return (
                  <TouchableOpacity
                    key={f.key}
                    onPress={() => setActiveFilter(f.key)}
                    activeOpacity={0.75}
                    style={[
                      styles.filterPill,
                      isActive && styles.filterPillActive,
                      isActive && isVitalFilter && styles.filterPillVital,
                    ]}
                  >
                    {isVitalFilter && (
                      <View
                        style={[
                          styles.filterDot,
                          isActive && styles.filterDotActive,
                        ]}
                      />
                    )}
                    <Text
                      style={[
                        styles.filterText,
                        isActive && styles.filterTextActive,
                        isActive && isVitalFilter && styles.filterTextVital,
                      ]}
                    >
                      {f.label}
                      {f.key === "VITAL" && vitalCount > 0
                        ? ` (${vitalCount})`
                        : ""}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* Compteur résultats à droite */}
              <View style={styles.filterCount}>
                <Text style={styles.filterCountText}>
                  {filteredAlerts.length} résultat
                  {filteredAlerts.length > 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          </View>
        }
        // ── État vide ──
        ListEmptyComponent={
          isError ? (
            <EmptyState
              icon="cloud-offline-outline"
              title="Erreur de connexion"
              subtitle="Vérifiez votre connexion et tirez pour réessayer."
            />
          ) : (
            <EmptyState
              icon="heart-outline"
              title="Aucune alerte dans votre zone"
              subtitle="Vous serez notifié dès qu'un hôpital a besoin de votre groupe sanguin."
            />
          )
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // ── Bannière Fantôme (Engagement expiré non annulé) ──
  ghostBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "rgba(220,30,30,0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(220,30,30,0.30)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  ghostTextBlock: {
    flex: 1,
    gap: 4,
  },
  ghostTitle: {
    color: COLORS.red,
    fontSize: 14,
    fontWeight: "700",
  },
  ghostSub: {
    // ✅ Voici la propriété manquante
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  ghostCancelBtn: {
    backgroundColor: COLORS.red,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexShrink: 0,
  },
  ghostCancelText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greeting: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bellBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.bg,
    paddingHorizontal: 3,
  },
  bellBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "800",
  },

  // ── Disponibilité ──
  availRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  availRowOn: {
    backgroundColor: "rgba(29,158,117,0.08)",
    borderColor: "rgba(29,158,117,0.22)",
  },
  availRowOff: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.08)",
  },
  availLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  availDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availDotOn: { backgroundColor: COLORS.green },
  availDotOff: { backgroundColor: "rgba(255,255,255,0.25)" },
  availTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },
  availSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 1,
  },

  // ── Engagement Banner ──
  engagementWrapper: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  engagementRow: {
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: "hidden",
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  engagementAccentBar: {
    height: 3,
    opacity: 0.85,
  },
  engagementInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  engagementIconContainer: {
    position: "relative",
    flexShrink: 0,
  },
  engagementIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  liveBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.bg,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  liveBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  engagementTextBlock: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  engagementTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  engagementTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  engagementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  engagementSub: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  engagementArrow: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  // ── Stats ──
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 10,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.cardBorder,
  },

  // ── Filtres ──
  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
    gap: 8,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBg,
  },
  filterPillActive: {
    backgroundColor: "rgba(220,30,30,0.12)",
    borderColor: "rgba(220,30,30,0.35)",
  },
  filterPillVital: {
    backgroundColor: "rgba(220,30,30,0.15)",
    borderColor: "rgba(220,30,30,0.40)",
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textSubtle,
  },
  filterDotActive: { backgroundColor: COLORS.red },
  filterText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  filterTextActive: { color: COLORS.white },
  filterTextVital: { color: COLORS.red },
  filterCount: { marginLeft: "auto" },
  filterCountText: {
    color: COLORS.textSubtle,
    fontSize: 11,
  },

  // ── Liste ──
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 100 : 80,
  },

  // ── Skeleton ──
  skeletonCard: {
    backgroundColor: "#111111",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    marginBottom: 12,
    opacity: 0.6,
  },
  skeletonRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 10,
  },
  skeletonBlood: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  skeletonInfo: { flex: 1, gap: 8, justifyContent: "center" },
  skeletonLine: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.08)",
    width: "90%",
  },
  skeletonFooter: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginTop: 4,
  },
});
