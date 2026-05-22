import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useAuthStore } from "@/src/store/auth.store";
import { useMyStaff, useRemoveStaff } from "@/src/hooks/useStaff";
import { StaffMember } from "@/src/types/healthStructure.type";
import { useIsStructurePending } from "@/src/hooks/useIsStructurePending";

// ─── Palette ──────────────────────────────────────────────────
const COLORS = {
  bg: "#080808",
  cardBg: "#111111",
  cardBorder: "rgba(255,255,255,0.07)",
  red: "#DC1E1E",
  green: "#1D9E75",
  amber: "#FAC775",
  blue: "#60A5FA",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.42)",
  textSubtle: "rgba(255,255,255,0.16)",
} as const;

const AVATAR_COLORS = [
  { bg: "rgba(29,158,117,0.14)", text: COLORS.green },
  { bg: "rgba(96,165,250,0.14)", text: COLORS.blue },
  { bg: "rgba(220,30,30,0.12)", text: COLORS.red },
  { bg: "rgba(250,199,117,0.14)", text: COLORS.amber },
];

// ─── StaffRow ─────────────────────────────────────────────────
function StaffRow({
  member,
  avatarColorIndex,
  isDirector,
  onDelete,
}: {
  member: StaffMember;
  avatarColorIndex: number;
  isDirector: boolean;
  onDelete: (id: string, name: string) => void;
}) {
  const isAdmin = member.isStructureAdmin;
  const avatarColor = isAdmin
    ? { bg: "rgba(250,199,117,0.14)", text: COLORS.amber }
    : AVATAR_COLORS[avatarColorIndex % AVATAR_COLORS.length];

  const initials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();

  return (
    <View style={styles.card}>
      <View style={[styles.avatar, { backgroundColor: avatarColor.bg }]}>
        <Text style={[styles.avatarText, { color: avatarColor.text }]}>
          {initials}
        </Text>
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {member.firstName} {member.lastName}
          </Text>
          {isAdmin && (
            <View style={styles.directorPill}>
              <Text style={styles.directorPillText}>Directeur</Text>
            </View>
          )}
        </View>
        <Text style={styles.email} numberOfLines={1}>
          {member.email}
        </Text>
      </View>

      {!isAdmin && isDirector && (
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() =>
            onDelete(member.id, `${member.firstName} ${member.lastName}`)
          }
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.red} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Écran Principal ───────────────────────────────────────────
export default function StaffScreen() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const tabBarHeight = useBottomTabBarHeight();
  const isPending = useIsStructurePending();

  const { data: staff, isLoading } = useMyStaff();
  const { mutateAsync: removeStaff } = useRemoveStaff();

  const isDirector = currentUser?.isStructureAdmin ?? false;

  const directors = staff?.filter((m) => m.isStructureAdmin) ?? [];
  const agents = staff?.filter((m) => !m.isStructureAdmin) ?? [];

  const handleDeleteStaff = (userId: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Retirer cet agent ?",
      `Voulez-vous vraiment retirer ${name} de votre structure ? Il perdra l'accès au tableau de bord médical.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Retirer",
          style: "destructive",
          onPress: async () => {
            try {
              await removeStaff(userId);
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
            } catch (error: any) {
              Alert.alert(
                "Erreur",
                error?.response?.data?.message ||
                  "Impossible de retirer cet agent.",
              );
            }
          },
        },
      ],
    );
  };

  const handleAddStaff = () => {
    if (isPending) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "Structure en attente de validation",
        "Votre structure doit être approuvée par nos équipes avant de pouvoir ajouter des agents.",
        [{ text: "Compris", style: "default" }],
      );
      return;
    }
    router.push("/(health)/staff/add" as any);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={COLORS.red} size="large" />
      </View>
    );
  }

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
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={19} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notre Équipe</Text>
          <Text style={styles.headerCount}>{staff?.length ?? 0} membres</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      {/* ── Banner pending ── */}
      {isPending && (
        <View style={styles.pendingBanner}>
          <Ionicons name="time-outline" size={15} color={COLORS.amber} />
          <Text style={styles.pendingBannerText}>
            Structure en attente de validation — ajout d&apos;agents désactivé
          </Text>
        </View>
      )}

      <FlatList
        data={listData}
        keyExtractor={(item, i) =>
          item.type === "section" ? `section-${i}` : item.member.id
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + 80 },
        ]}
        showsVerticalScrollIndicator={false}
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
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={40}
              color={COLORS.textSubtle}
            />
            <Text style={styles.emptyTitle}>Aucun agent enregistré</Text>
            <Text style={styles.emptySub}>
              Ajoutez des infirmiers ou agents pour gérer les alertes.
            </Text>
          </View>
        }
      />

      {/* ── FAB ── */}
      <TouchableOpacity
        style={[
          styles.fab,
          { bottom: tabBarHeight + 20 },
          isPending && { backgroundColor: "#3A3A3A", shadowOpacity: 0 },
        ]}
        onPress={handleAddStaff}
        activeOpacity={isPending ? 0.6 : 0.85}
      >
        <Ionicons
          name="add"
          size={28}
          color={isPending ? "rgba(255,255,255,0.35)" : COLORS.white}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: { alignItems: "center", justifyContent: "center" },
  listContent: { paddingHorizontal: 20, paddingTop: 4 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { alignItems: "center", gap: 2 },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: "800" },
  headerCount: { color: COLORS.textMuted, fontSize: 11, fontWeight: "600" },

  // Pending Banner
  pendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "rgba(250,199,117,0.08)",
    borderWidth: 0.5,
    borderColor: "rgba(250,199,117,0.22)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pendingBannerText: {
    color: COLORS.amber,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },

  // Section label
  sectionLabel: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 6,
  },

  // Card
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    padding: 13,
    marginBottom: 9,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: { fontSize: 16, fontWeight: "900" },
  info: { flex: 1, gap: 3 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexWrap: "wrap",
  },
  name: { color: COLORS.white, fontSize: 15, fontWeight: "700" },
  directorPill: {
    backgroundColor: "rgba(250,199,117,0.13)",
    borderWidth: 0.5,
    borderColor: "rgba(250,199,117,0.30)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  directorPillText: { color: COLORS.amber, fontSize: 10, fontWeight: "700" },
  email: { color: COLORS.textMuted, fontSize: 12 },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "rgba(220,30,30,0.08)",
    borderWidth: 0.5,
    borderColor: "rgba(220,30,30,0.22)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  // Empty
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
    paddingHorizontal: 20,
  },
  emptyTitle: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  emptySub: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },

  // FAB
  fab: {
    position: "absolute",
    right: 22,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 10,
  },
});
