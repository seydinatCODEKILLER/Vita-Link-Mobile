import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/src/theme/useTheme"; // ← Autonome

import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { StaffSkeleton } from "@/src/components/staff/StaffSkeleton";
import { StaffRow } from "@/src/components/staff/StaffRow";

import { useStaffScreen } from "@/src/hooks/useStaffScreen";
import { useStaffStyles } from "@/src/hooks/useStaffStyles";
import { StaffMember } from "@/src/types/healthStructure.type";

export default function StaffScreen() {
  const colors = useColors();
  const {
    goBack,
    staff,
    isLoading,
    isError,
    hasNetworkError,
    refetch,
    isPending,
    isDirector,
    directors,
    agents,
    handleDeleteStaff,
    handleAddStaff,
  } = useStaffScreen();

  const { styles } = useStaffStyles();

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={19} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notre Équipe</Text>
          <Text style={styles.headerCount}>{staff?.length ?? 0} membres</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      {isPending && (
        <View style={styles.pendingBanner}>
          <Ionicons name="time-outline" size={15} color={colors.amber} />
          <Text style={styles.pendingBannerText}>
            Structure en attente de validation — ajout d&apos;agents désactivé
          </Text>
        </View>
      )}
    </>
  );

  // ── 1. Chargement initial (Skeleton) ───────────────────────
  if (isLoading && !staff) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        {renderHeader()}
        <StaffSkeleton />
      </SafeAreaView>
    );
  }

  // ── 2. Erreur réseau sans cache ────────────────────────────
  if (hasNetworkError && !staff) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        {renderHeader()}
        <NetworkErrorScreen onRetry={refetch} />
      </SafeAreaView>
    );
  }

  // ── 3. Rendu normal ─────────────────────────────────────────
  type ListItem =
    | { type: "section"; label: string }
    | { type: "member"; member: StaffMember; index: number };

  const listData: ListItem[] = [
    { type: "section", label: "DIRECTION" },
    ...directors.map((m) => ({ type: "member" as const, member: m, index: 0 })),
    { type: "section", label: `AGENTS (${agents.length})` },
    ...agents.map((m, i) => ({ type: "member" as const, member: m, index: i })),
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={listData}
        keyExtractor={(item, i) =>
          item.type === "section" ? `section-${i}` : item.member.id
        }
        contentContainerStyle={[styles.listContent, styles.listContentPadding]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => {
          if (item.type === "section") {
            return <Text style={styles.sectionLabel}>{item.label}</Text>;
          }
          return (
            <StaffRow
              member={item.member}
              avatarColorIndex={item.index}
              isDirector={isDirector}
              onDelete={handleDeleteStaff}
            />
          );
        }}
        ListEmptyComponent={
          isError ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="cloud-offline-outline"
                size={40}
                color={colors.textSubtle}
              />
              <Text style={styles.emptyTitle}>Erreur de chargement</Text>
              <Text style={styles.emptySub}>
                Impossible de récupérer la liste du personnel.
              </Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="people-outline"
                size={40}
                color={colors.textSubtle}
              />
              <Text style={styles.emptyTitle}>Aucun agent enregistré</Text>
              <Text style={styles.emptySub}>
                Ajoutez des infirmiers ou agents pour gérer les alertes.
              </Text>
            </View>
          )
        }
      />

      {/* ── FAB ── */}
      <TouchableOpacity
        style={[styles.fab, styles.fabBottom, isPending && styles.fabDisabled]}
        onPress={handleAddStaff}
        activeOpacity={isPending ? 0.6 : 0.85}
      >
        <Ionicons
          name="add"
          size={28}
          color={isPending ? colors.textSubtle : colors.white}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
