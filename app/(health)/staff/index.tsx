import React from "react";
import {
  View,
  Text,
  FlatList,
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
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { AppColors } from "@/src/theme/colors";

// ─── Imports pour l'erreur réseau ─────────────────────────────
import { isNetworkError } from "@/src/utils/error.utils";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";

// ─── Config Avatar Colors (Dynamique) ────────────────────────
const getAvatarColors = (colors: AppColors) => [
  { bg: colors.success + "14", text: colors.success },
  { bg: "#60A5FA14", text: "#60A5FA" },
  { bg: colors.red + "12", text: colors.red },
  { bg: colors.amber + "14", text: colors.amber },
];

// ─── Skeleton Staff ────────────────────────────────────────────
function StaffSkeleton({ colors }: { colors: AppColors }) {
  const styles = useThemedStyles((c) => ({
    cardBg: {
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
    },
    line: {
      height: 10,
      borderRadius: 5,
      backgroundColor: c.cardBorder,
    },
  }));

  return (
    <View style={{ paddingHorizontal: 20, gap: 9, opacity: 0.6 }}>
      {/* Fake Section */}
      <View
        style={[
          styles.line,
          { width: "30%", height: 8, marginTop: 6, marginBottom: 10 },
        ]}
      />
      {[1, 2].map((i) => (
        <View
          key={`dir-${i}`}
          style={[
            styles.cardBg,
            {
              flexDirection: "row",
              alignItems: "center",
              gap: 13,
              padding: 13,
            },
          ]}
        >
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              backgroundColor: colors.cardBorder,
            }}
          />
          <View style={{ flex: 1, gap: 6 }}>
            <View style={[styles.line, { width: "50%" }]} />
            <View style={[styles.line, { width: "70%", height: 8 }]} />
          </View>
        </View>
      ))}
      {/* Fake Section 2 */}
      <View
        style={[
          styles.line,
          { width: "40%", height: 8, marginTop: 16, marginBottom: 10 },
        ]}
      />
      {[1, 2, 3].map((i) => (
        <View
          key={`agt-${i}`}
          style={[
            styles.cardBg,
            {
              flexDirection: "row",
              alignItems: "center",
              gap: 13,
              padding: 13,
            },
          ]}
        >
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              backgroundColor: colors.cardBorder,
            }}
          />
          <View style={{ flex: 1, gap: 6 }}>
            <View style={[styles.line, { width: "60%" }]} />
            <View style={[styles.line, { width: "80%", height: 8 }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

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
  const colors = useColors();
  const AVATAR_COLORS = getAvatarColors(colors);

  const isAdmin = member.isStructureAdmin;
  const avatarColor = isAdmin
    ? { bg: colors.amber + "14", text: colors.amber }
    : AVATAR_COLORS[avatarColorIndex % AVATAR_COLORS.length];

  const initials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();

  const styles = useThemedStyles((c) => ({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 13,
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
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
    name: { color: c.white, fontSize: 15, fontWeight: "700" },
    directorPill: {
      backgroundColor: c.amber + "13",
      borderWidth: 0.5,
      borderColor: c.amber + "30",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    directorPillText: { color: c.amber, fontSize: 10, fontWeight: "700" },
    email: { color: c.textMuted, fontSize: 12 },
    deleteBtn: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: c.red + "08",
      borderWidth: 0.5,
      borderColor: c.red + "22",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
  }));

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
          <Ionicons name="trash-outline" size={16} color={colors.red} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Écran Principal ───────────────────────────────────────────
export default function StaffScreen() {
  const router = useRouter();
  const colors = useColors();
  const currentUser = useAuthStore((s) => s.user);
  const tabBarHeight = useBottomTabBarHeight();
  const isPending = useIsStructurePending();

  // ─── RÉCUPÉRATION DES DONNées ET ERREURS ────────────────────
  const { data: staff, isLoading, isError, error, refetch } = useMyStaff();

  const { mutateAsync: removeStaff } = useRemoveStaff();

  // ─── LOGIQUE D'ERREUR RÉSEAU ────────────────────────────────
  const hasNetworkError = isError && isNetworkError(error);

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

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    centered: { alignItems: "center", justifyContent: "center" },
    listContent: { paddingHorizontal: 20, paddingTop: 4 },
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
      backgroundColor: c.cardBg,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    headerCenter: { alignItems: "center", gap: 2 },
    headerTitle: { color: c.white, fontSize: 18, fontWeight: "800" },
    headerCount: { color: c.textMuted, fontSize: 11, fontWeight: "600" },
    pendingBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginHorizontal: 20,
      marginBottom: 12,
      backgroundColor: c.amber + "08",
      borderWidth: 0.5,
      borderColor: c.amber + "22",
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    pendingBannerText: {
      color: c.amber,
      fontSize: 12,
      fontWeight: "600",
      flex: 1,
    },
    sectionLabel: {
      color: c.textSubtle,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1.5,
      marginBottom: 10,
      marginTop: 6,
    },
    emptyState: {
      alignItems: "center",
      paddingTop: 60,
      gap: 12,
      paddingHorizontal: 20,
    },
    emptyTitle: { color: c.white, fontSize: 16, fontWeight: "700" },
    emptySub: {
      color: c.textMuted,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
    },
    fab: {
      position: "absolute",
      right: 22,
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: c.red,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: c.red,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.28,
      shadowRadius: 14,
      elevation: 10,
    },
    fabDisabled: {
      backgroundColor: c.cardBorder,
      shadowOpacity: 0,
      elevation: 0,
    },
  }));

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
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
        <StaffSkeleton colors={colors} />
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
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + 80 },
        ]}
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
        style={[
          styles.fab,
          { bottom: tabBarHeight + 20 },
          isPending && styles.fabDisabled,
        ]}
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
