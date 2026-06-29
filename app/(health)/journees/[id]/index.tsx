import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import dayjs from "dayjs";
import "dayjs/locale/fr";

import { FormInput } from "@/src/components/ui/FormInput";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { isNetworkError } from "@/src/utils/error.utils";
import { RegistrationCard } from "@/src/components/donation-days/RegistrationCard";
import { useDayDetailScreen } from "@/src/hooks/useDayDetailScreen";
import { useDayDetailStyles } from "@/src/styles/useDayDetailStyles";
import { useColors } from "@/src/theme/useTheme";
import { STATS, FILTERS } from "@/src/constants/dayDetailConfig";

dayjs.locale("fr");

export default function DayDetailScreen() {
  const router = useRouter();
  const colors = useColors();

  const {
    id,
    goBack,
    day,
    isLoadingDay,
    hasNetworkError,
    refetchDay,
    isLoadingReg,
    isRegError,
    regError,
    refetchReg,
    isCancelling,
    activeRegFilter,
    setActiveRegFilter,
    isCancelModalVisible,
    setIsCancelModalVisible,
    cancelReason,
    setCancelReason,
    handleMarkAttendance,
    handleCancelDay,
    confirmCancelDay,
    summary,
    filteredRegistrations,
  } = useDayDetailScreen();

  const { styles } = useDayDetailStyles();

  // ── 1. Erreur réseau sans cache ──
  if (hasNetworkError) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={goBack}
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

  // ── 2. Loading classique ──
  if (isLoadingDay || !day) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={[styles.header, { justifyContent: "center" }]}>
          <ActivityIndicator color={colors.red} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  // ── 3. Rendu principal ──
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={filteredRegistrations}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent} // ← Propre et centralisé
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={goBack}
                style={styles.backBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={18} color={colors.white} />
              </TouchableOpacity>
              <Text style={styles.headerTitle} numberOfLines={1}>
                Détail de l&apos;événement
              </Text>

              {day.status === "PUBLISHED" && (
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() =>
                    router.push(`/(health)/journees/${id}/edit?from=detail`)
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
            scheduledDate={day.scheduledDate}
            onMark={handleMarkAttendance}
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
                <ActivityIndicator color={colors.red} size="small" /> // ← Remplacement de #EF4444
              ) : (
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color={colors.red} // ← Remplacement de #EF4444
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
