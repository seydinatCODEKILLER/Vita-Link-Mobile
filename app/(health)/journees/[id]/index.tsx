import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
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
  useDayRegistrations,
  useMarkAttendance,
  useCancelDay,
} from "@/src/hooks/useDonationDays";
import {
  DayRegistration,
  RegistrationStatus,
  RegistrationSummary,
} from "@/src/types/donation-day.types";
import { FormInput } from "@/src/components/ui/FormInput";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { isNetworkError } from "@/src/utils/error.utils";

dayjs.locale("fr");

// ─── Configuration des statuts ────────────────────────────────
const REGISTRATION_STATUS_CONFIG = {
  REGISTERED: {
    label: "En attente",
    color: "#F59E0B",
    icon: "time-outline" as const,
  },
  ATTENDED: {
    label: "Présent",
    color: "#10B981",
    icon: "checkmark-circle-outline" as const,
  },
  NO_SHOW: {
    label: "Absent",
    color: "#EF4444",
    icon: "close-circle-outline" as const,
  },
  CANCELLED: {
    label: "Annulé",
    color: "#6B7280",
    icon: "ban-outline" as const,
  },
};

// ─── Carte d'inscription ──────────────────────────────────────
function RegistrationCard({
  item,
  onMark,
  colors,
}: {
  item: DayRegistration;
  onMark: (registrationId: string, status: "ATTENDED" | "NO_SHOW") => void;
  colors: any;
}) {
  const statusConf =
    REGISTRATION_STATUS_CONFIG[item.status] ||
    REGISTRATION_STATUS_CONFIG.REGISTERED;
  const initials = `${item.donor.firstName[0]}${item.donor.lastName[0]}`;

  const styles = useThemedStyles((c) => ({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: c.cardBg,
      borderRadius: 14,
      padding: 14,
      marginHorizontal: 20,
      marginBottom: 8,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: statusConf.color + "15",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: statusConf.color,
      fontSize: 15,
      fontWeight: "700",
    },
    info: {
      flex: 1,
      gap: 3,
    },
    name: {
      color: c.white,
      fontSize: 14,
      fontWeight: "600",
      letterSpacing: -0.2,
    },
    meta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    bloodType: {
      color: statusConf.color,
      fontSize: 11,
      fontWeight: "700",
    },
    phone: {
      color: c.textMuted,
      fontSize: 12,
      fontWeight: "400",
    },
    metaDivider: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: c.textMuted + "40",
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: statusConf.color + "12",
    },
    statusDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: statusConf.color,
    },
    statusText: {
      color: statusConf.color,
      fontSize: 10,
      fontWeight: "600",
    },
    actions: {
      flexDirection: "row",
      gap: 6,
      marginTop: 8,
    },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
    },
    actionBtnText: {
      fontSize: 11,
      fontWeight: "600",
    },
  }));

  return (
    <View style={styles.card}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      {/* Infos */}
      <View style={styles.info}>
        <Text style={styles.name}>
          {item.donor.firstName} {item.donor.lastName}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.bloodType}>
            {item.donor.bloodType?.replace("_POS", "+").replace("_NEG", "-")}
          </Text>
          <View style={styles.metaDivider} />
          <Text style={styles.phone}>{item.donor.phone}</Text>
        </View>

        {/* Actions */}
        {item.status === "REGISTERED" && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#10B981" + "12" }]}
              onPress={() => onMark(item.id, "ATTENDED")}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark" size={14} color="#10B981" />
              <Text style={[styles.actionBtnText, { color: "#10B981" }]}>
                Présent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#EF4444" + "12" }]}
              onPress={() => onMark(item.id, "NO_SHOW")}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={14} color="#EF4444" />
              <Text style={[styles.actionBtnText, { color: "#EF4444" }]}>
                Absent
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Badge statut */}
      <View style={styles.statusBadge}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>{statusConf.label}</Text>
      </View>
    </View>
  );
}

// ─── Écran Principal ──────────────────────────────────────────
export default function DayDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const tabBarHeight = useBottomTabBarHeight();

  const {
    data: day,
    isLoading: isLoadingDay,
    isError: isDayError,
    error: dayError,
    refetch: refetchDay,
  } = useDayDetail(id);

  const {
    data: registrationsData,
    isLoading: isLoadingReg,
    isError: isRegError,
    error: regError,
    refetch: refetchReg,
  } = useDayRegistrations(id);

  const { mutateAsync: markAttendance } = useMarkAttendance();
  const { mutateAsync: cancelDay, isPending: isCancelling } = useCancelDay();

  const [activeRegFilter, setActiveRegFilter] = useState<
    RegistrationStatus | "ALL"
  >("ALL");
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const styles = useThemedStyles((c) => ({
    container: {
      flex: 1,
      backgroundColor: c.bg,
    },
    // Header
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
    headerTitle: {
      color: c.textMuted,
      fontSize: 14,
      fontWeight: "500",
      flex: 1,
    },
    editBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: c.red + "15",
      alignItems: "center",
      justifyContent: "center",
    },
    // Cover
    cover: {
      height: 160,
      backgroundColor: c.red + "05",
      marginHorizontal: 16,
      borderRadius: 16,
      overflow: "hidden",
    },
    coverPlaceholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    coverImage: {
      width: "100%",
      height: "100%",
    },
    // Section info
    infoSection: {
      paddingHorizontal: 20,
      paddingTop: 20,
      gap: 14,
    },
    title: {
      color: c.white,
      fontSize: 22,
      fontWeight: "700",
      letterSpacing: -0.3,
      lineHeight: 28,
    },
    metaContainer: {
      gap: 8,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    metaText: {
      color: c.textMuted,
      fontSize: 13,
      fontWeight: "400",
    },
    // Groupes sanguins
    bloodTypesContainer: {
      flexDirection: "row",
      gap: 6,
      flexWrap: "wrap",
    },
    bloodPill: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: c.red + "08",
    },
    bloodPillText: {
      color: c.red,
      fontSize: 11,
      fontWeight: "600",
    },
    // Stats
    statsRow: {
      flexDirection: "row",
      gap: 8,
    },
    statCard: {
      flex: 1,
      backgroundColor: c.cardBg,
      borderRadius: 14,
      padding: 14,
      alignItems: "center",
      gap: 4,
    },
    statValue: {
      fontSize: 22,
      fontWeight: "700",
      letterSpacing: -0.5,
    },
    statLabel: {
      fontSize: 11,
      color: c.textMuted,
      fontWeight: "500",
    },
    // Séparateur
    separator: {
      height: 1,
      backgroundColor: c.cardBorder + "30",
      marginVertical: 8,
    },
    // Section inscriptions
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    sectionTitle: {
      color: c.white,
      fontSize: 17,
      fontWeight: "600",
      letterSpacing: -0.2,
    },
    sectionCount: {
      color: c.textMuted,
      fontSize: 13,
      fontWeight: "500",
    },
    // Filtres
    filtersScroll: {
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    filtersRow: {
      flexDirection: "row",
      gap: 6,
    },
    filterChip: {
      paddingVertical: 7,
      paddingHorizontal: 14,
      borderRadius: 100,
      backgroundColor: c.cardBg,
    },
    filterChipActive: {
      backgroundColor: c.red + "10",
    },
    filterChipText: {
      color: c.textMuted,
      fontSize: 12,
      fontWeight: "500",
    },
    filterChipTextActive: {
      color: c.red,
      fontWeight: "600",
    },
    // Bouton annulation
    cancelButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 40,
      borderRadius: 14,
      backgroundColor: c.cardBg,
    },
    cancelButtonText: {
      color: "#EF4444",
      fontSize: 14,
      fontWeight: "600",
    },
    // Empty state
    emptyState: {
      alignItems: "center",
      paddingTop: 40,
      paddingHorizontal: 40,
      gap: 12,
    },
    emptyIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: c.cardBorder + "15",
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      color: c.textMuted,
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
    },
    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: c.cardBg,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      gap: 20,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    modalTitle: {
      color: c.white,
      fontSize: 18,
      fontWeight: "700",
    },
    modalCloseBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.cardBorder + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    modalDescription: {
      color: c.textMuted,
      fontSize: 13,
      lineHeight: 20,
    },
    modalActions: {
      flexDirection: "row",
      gap: 10,
    },
    modalBtnSecondary: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: c.cardBorder + "20",
      alignItems: "center",
    },
    modalBtnSecondaryText: {
      color: c.white,
      fontWeight: "600",
      fontSize: 14,
    },
    modalBtnDanger: {
      flex: 1,
      flexDirection: "row",
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: "#EF4444",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    modalBtnDangerText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 14,
    },
  }));

  const handleMarkAttendance = (
    registrationId: string,
    status: "ATTENDED" | "NO_SHOW",
  ) => {
    markAttendance({ dayId: id, registrationId, status }).catch(() => {});
  };

  const handleCancelDay = () => {
    setCancelReason("");
    setIsCancelModalVisible(true);
  };

  const confirmCancelDay = async () => {
    if (cancelReason.trim().length < 5) {
      Alert.alert(
        "Raison requise",
        "Veuillez saisir une raison d'au moins 5 caractères.",
      );
      return;
    }
    try {
      await cancelDay({ dayId: id, cancelReason: cancelReason.trim() });
      setIsCancelModalVisible(false);
      router.back();
    } catch (error) {
      // Géré globalement
    }
  };

  // ── 1. Erreur réseau sans cache (Journée introuvable hors-ligne) ──
  if (isDayError && !day && isNetworkError(dayError)) {
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
            Détail de l&apos;événement
          </Text>
        </View>
        <NetworkErrorScreen
          onRetry={refetchDay}
          message="Impossible de charger les détails de cette journée."
        />
      </SafeAreaView>
    );
  }

  // ── 2. Loading classique ───────────────────────────────────────
  if (isLoadingDay || !day) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={[styles.header, { justifyContent: "center" }]}>
          <ActivityIndicator color={colors.red} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const registrations = registrationsData?.registrations ?? [];
  const summary = registrationsData?.summary ?? {
    registered: 0,
    attended: 0,
    noShow: 0,
    cancelled: 0,
  };

  const filteredRegistrations =
    activeRegFilter === "ALL"
      ? registrations
      : registrations.filter((r) => r.status === activeRegFilter);

  const STATS: {
    key: keyof RegistrationSummary;
    label: string;
    color: string;
  }[] = [
    { key: "registered", label: "En attente", color: "#F59E0B" },
    { key: "attended", label: "Présents", color: "#10B981" },
    { key: "noShow", label: "Absents", color: "#EF4444" },
  ];

  const FILTERS = [
    { key: "ALL", label: "Tous" },
    { key: "REGISTERED", label: "En attente" },
    { key: "ATTENDED", label: "Présents" },
    { key: "NO_SHOW", label: "Absents" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={filteredRegistrations}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 40 }}
        ListHeaderComponent={
          <View>
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
                Détail de l&apos;événement
              </Text>

              {/* ✅ Bouton Modifier (Visible uniquement si PUBLISHED) */}
              {day.status === "PUBLISHED" && (
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() =>
                    router.push(`/(health)/journees/${id}/edit` as any)
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color={colors.red}
                  />
                </TouchableOpacity>
              )}
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
                <View style={styles.coverPlaceholder}>
                  <Ionicons
                    name="calendar-outline"
                    size={40}
                    color={colors.red + "20"}
                  />
                </View>
              )}
            </View>

            {/* Infos */}
            <View style={styles.infoSection}>
              <Text style={styles.title}>{day.title}</Text>

              <View style={styles.metaContainer}>
                <View style={styles.metaRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={15}
                    color={colors.red}
                  />
                  <Text style={styles.metaText}>
                    {dayjs(day.scheduledDate).format("DD MMMM YYYY")}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={15} color={colors.red} />
                  <Text style={styles.metaText}>
                    {day.startTime?.slice(0, 5)} - {day.endTime?.slice(0, 5)}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons
                    name="location-outline"
                    size={15}
                    color={colors.red}
                  />
                  <Text style={styles.metaText}>{day.address}</Text>
                </View>
              </View>

              {/* Groupes sanguins */}
              <View style={styles.bloodTypesContainer}>
                {day.bloodTypesNeeded.length === 0 ? (
                  <View style={styles.bloodPill}>
                    <Text style={styles.bloodPillText}>Tous les groupes</Text>
                  </View>
                ) : (
                  day.bloodTypesNeeded.map((bt) => (
                    <View key={bt} style={styles.bloodPill}>
                      <Text style={styles.bloodPillText}>
                        {bt.replace("_POS", "+").replace("_NEG", "-")}
                      </Text>
                    </View>
                  ))
                )}
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                {STATS.map((stat) => (
                  <View key={stat.key} style={styles.statCard}>
                    <Text style={[styles.statValue, { color: stat.color }]}>
                      {summary[stat.key]}
                    </Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.separator} />
            </View>

            {/* Titre section + Filtres */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Inscrits</Text>
              <Text style={styles.sectionCount}>
                {filteredRegistrations.length} personne(s)
              </Text>
            </View>

            <View style={styles.filtersScroll}>
              <View style={styles.filtersRow}>
                {FILTERS.map((filter) => {
                  const isActive = activeRegFilter === filter.key;
                  return (
                    <TouchableOpacity
                      key={filter.key}
                      style={[
                        styles.filterChip,
                        isActive && styles.filterChipActive,
                      ]}
                      onPress={() => setActiveRegFilter(filter.key as any)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isActive && styles.filterChipTextActive,
                        ]}
                      >
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {isLoadingReg && (
              <ActivityIndicator
                color={colors.red}
                style={{ marginVertical: 20 }}
              />
            )}
          </View>
        }
        renderItem={({ item }) => (
          <RegistrationCard
            item={item}
            onMark={handleMarkAttendance}
            colors={colors}
          />
        )}
        ListFooterComponent={
          day.status === "PUBLISHED" ? (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelDay}
              disabled={isCancelling}
              activeOpacity={0.7}
            >
              {isCancelling ? (
                <ActivityIndicator color="#EF4444" size="small" />
              ) : (
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color="#EF4444"
                />
              )}
              <Text style={styles.cancelButtonText}>
                {isCancelling ? "Annulation..." : "Annuler cette journée"}
              </Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          !isLoadingReg ? (
            isRegError && isNetworkError(regError) ? (
              // Erreur réseau pour les inscriptions
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="cloud-offline-outline"
                    size={24}
                    color={colors.textMuted}
                  />
                </View>
                <Text style={styles.emptyText}>
                  Impossible de charger les inscriptions.
                </Text>
                <TouchableOpacity
                  onPress={() => refetchReg()}
                  style={{
                    marginTop: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: colors.red + "15",
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      color: colors.red,
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    Réessayer
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Vraiment aucun inscrit
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="people-outline"
                    size={24}
                    color={colors.textMuted}
                  />
                </View>
                <Text style={styles.emptyText}>
                  Aucun inscrit pour ce filtre
                </Text>
              </View>
            )
          ) : null
        }
      />

      {/* Modal d'annulation */}
      <Modal visible={isCancelModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Annuler la journée</Text>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setIsCancelModalVisible(false)}
                >
                  <Ionicons name="close" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDescription}>
                Cette action est irréversible. Les donneurs inscrits seront
                notifiés de l&apos;annulation.
              </Text>

              <FormInput
                label="Raison de l'annulation"
                icon="alert-circle-outline"
                placeholder="Contraintes logistiques imprévues..."
                value={cancelReason}
                onChangeText={setCancelReason}
                multiline
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalBtnSecondary}
                  onPress={() => setIsCancelModalVisible(false)}
                >
                  <Text style={styles.modalBtnSecondaryText}>Retour</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalBtnDanger,
                    { opacity: isCancelling ? 0.6 : 1 },
                  ]}
                  onPress={confirmCancelDay}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                  )}
                  <Text style={styles.modalBtnDangerText}>
                    {isCancelling ? "En cours..." : "Confirmer"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
