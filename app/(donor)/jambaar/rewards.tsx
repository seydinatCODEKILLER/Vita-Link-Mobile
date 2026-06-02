import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import dayjs from "dayjs";
import { useAuthStore } from "@/src/store/auth.store";
import { useJambaarProfile } from "@/src/hooks/useJambaar";
import { useMyCoupons, useRedeemReward } from "@/src/hooks/useCoupons";
import { Coupon, Reward } from "@/src/types/domain.types";
import { useRewards } from "@/src/hooks/useRewards";
import { useSmartBack } from "@/src/hooks/useSmartBack"; // ✅ Ajoute cette ligne
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { AppColors } from "@/src/theme/colors";

// ─── Imports pour l'erreur réseau ─────────────────────────────
import { isNetworkError } from "@/src/utils/error.utils";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";

type TabType = "catalogue" | "coupons";
type CouponFilter = "ACTIVE" | "USED" | "EXPIRED";

// ─── Skeleton Rewards ─────────────────────────────────────────
function RewardsSkeleton({ colors }: { colors: AppColors }) {
  const styles = useThemedStyles((c) => ({
    cardBg: {
      backgroundColor: c.cardBg,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    line: { height: 10, borderRadius: 5, backgroundColor: c.cardBorder },
  }));

  return (
    <View style={{ paddingHorizontal: 20, gap: 12, opacity: 0.6 }}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={[styles.cardBg, { padding: 16, gap: 10 }]}>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                backgroundColor: colors.cardBorder,
              }}
            />
            <View style={[styles.line, { width: "30%", height: 8 }]} />
          </View>
          <View style={[styles.line, { width: "70%" }]} />
          <View style={[styles.line, { width: "50%", height: 8 }]} />
          <View
            style={{
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.cardBorder,
            }}
          />
          <View
            style={{
              height: 40,
              borderRadius: 12,
              backgroundColor: colors.cardBorder,
              marginTop: 4,
            }}
          />
        </View>
      ))}
    </View>
  );
}

// ─── Skeleton Coupons ─────────────────────────────────────────
function CouponsSkeleton({ colors }: { colors: AppColors }) {
  const styles = useThemedStyles((c) => ({
    cardBg: {
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    line: { height: 10, borderRadius: 5, backgroundColor: c.cardBorder },
  }));

  return (
    <View style={{ paddingHorizontal: 20, gap: 10, opacity: 0.6 }}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={[
            styles.cardBg,
            { flexDirection: "row", padding: 14, gap: 12 },
          ]}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: colors.cardBorder,
            }}
          />
          <View style={{ flex: 1, gap: 6, justifyContent: "center" }}>
            <View style={[styles.line, { width: "60%" }]} />
            <View style={[styles.line, { width: "40%", height: 8 }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Reward Card ──────────────────────────────────────────────
function RewardCard({
  reward,
  userPoints,
  onRedeem,
  isRedeeming,
}: {
  reward: Reward;
  userPoints: number;
  onRedeem: (id: string) => void;
  isRedeeming: boolean;
}) {
  const colors = useColors();
  const canAfford = userPoints >= reward.pointsCost;
  const pointsNeeded = reward.pointsCost - userPoints;
  const progressPct = Math.min((userPoints / reward.pointsCost) * 100, 100);

  const accentColor = canAfford ? colors.success : colors.amber;

  const styles = useThemedStyles((c) => ({
    // Outer card
    card: {
      backgroundColor: c.cardBg,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.cardBorder,
      overflow: "hidden",
      marginBottom: 12,
    },

    // Top color accent bar
    accentBar: {
      height: 3,
      width: "100%",
    },

    // Body padding
    body: {
      padding: 16,
      paddingBottom: 14,
      gap: 0,
    },

    // Partner chip
    partnerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 11,
    },
    partnerChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 4,
      paddingLeft: 5,
      paddingRight: 8,
      borderRadius: 8,
      backgroundColor: c.cardBorder + "30",
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    partnerIconBox: {
      width: 18,
      height: 18,
      borderRadius: 5,
      backgroundColor: c.cardBorder + "50",
      alignItems: "center",
      justifyContent: "center",
    },
    partnerName: {
      color: c.textMuted,
      fontSize: 11,
      fontWeight: "600",
    },

    // Title / desc
    title: {
      color: c.white,
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: -0.3,
      lineHeight: 21,
      marginBottom: 5,
    },
    desc: {
      color: c.textSubtle,
      fontSize: 12,
      lineHeight: 19,
      marginBottom: 14,
    },

    // Cost
    costTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 7,
    },
    costPts: {
      fontSize: 19,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    costRight: {
      fontSize: 11,
      fontWeight: "600",
    },
    progressTrack: {
      height: 5,
      borderRadius: 3,
      backgroundColor: c.cardBorder,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 3,
    },

    // Redeem button zone (bottom of card)
    redeemZone: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 13,
    },
    redeemActive: {
      backgroundColor: c.success + "18",
      borderTopWidth: 1,
      borderTopColor: c.success + "22",
    },
    redeemLocked: {
      backgroundColor: c.cardBg,
      borderTopWidth: 1,
      borderTopColor: c.cardBorder,
    },
    redeemText: {
      fontSize: 13,
      fontWeight: "700",
    },
  }));

  return (
    <View style={styles.card}>
      {/* Accent bar */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      {/* Body */}
      <View style={styles.body}>
        {/* Partner chip */}
        <View style={styles.partnerRow}>
          <View style={styles.partnerChip}>
            <View style={styles.partnerIconBox}>
              <Ionicons
                name="business-outline"
                size={11}
                color={colors.textMuted}
              />
            </View>
            <Text style={styles.partnerName} numberOfLines={1}>
              {reward.partner.name}
            </Text>
          </View>
        </View>

        {/* Title & desc */}
        <Text style={styles.title} numberOfLines={2}>
          {reward.title}
        </Text>
        <Text style={styles.desc} numberOfLines={2}>
          {reward.description}
        </Text>

        {/* Cost + progress */}
        <View style={styles.costTop}>
          <Text style={[styles.costPts, { color: accentColor }]}>
            {reward.pointsCost.toLocaleString()} pts
          </Text>
          {canAfford ? (
            <Text style={[styles.costRight, { color: colors.success }]}>
              ✓ Solde suffisant
            </Text>
          ) : (
            <Text style={[styles.costRight, { color: colors.textSubtle }]}>
              − {pointsNeeded.toLocaleString()} pts manquants
            </Text>
          )}
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPct}%`,
                backgroundColor: accentColor,
              },
            ]}
          />
        </View>
      </View>

      {/* Redeem zone */}
      <TouchableOpacity
        style={[
          styles.redeemZone,
          canAfford ? styles.redeemActive : styles.redeemLocked,
        ]}
        onPress={() => canAfford && onRedeem(reward.id)}
        activeOpacity={canAfford ? 0.75 : 1}
        disabled={!canAfford || isRedeeming}
      >
        {isRedeeming ? (
          <ActivityIndicator color={colors.success} size="small" />
        ) : canAfford ? (
          <>
            <Ionicons name="gift-outline" size={16} color={colors.success} />
            <Text style={[styles.redeemText, { color: colors.success }]}>
              Échanger maintenant
            </Text>
          </>
        ) : (
          <>
            <Ionicons
              name="lock-closed-outline"
              size={14}
              color={colors.textSubtle}
            />
            <Text
              style={[
                styles.redeemText,
                { color: colors.textSubtle, fontWeight: "600", fontSize: 12 },
              ]}
            >
              Points insuffisants
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Coupon Card ──────────────────────────────────────────────
function CouponCard({ coupon }: { coupon: Coupon }) {
  const colors = useColors();

  const isActive = coupon.status === "ACTIVE";
  const isUsed = coupon.status === "USED";
  const isExpired = coupon.status === "EXPIRED";

  const statusColor = isActive
    ? colors.success
    : isUsed
      ? colors.textSubtle
      : colors.amber;

  const statusLabel = isActive ? "Actif" : isUsed ? "Utilisé" : "Expiré";
  const statusEmoji = isActive ? "🎫" : isUsed ? "✅" : "⏳";

  const styles = useThemedStyles((c) => ({
    card: {
      flexDirection: "row",
      alignItems: "stretch",
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: isActive ? 1.5 : 1,
      borderColor: isActive ? c.success + "38" : c.cardBorder,
      overflow: "hidden",
      marginBottom: 10,
    },

    // Left stripe
    stripe: {
      width: 54,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      backgroundColor: isActive
        ? c.success + "12"
        : isUsed
          ? c.cardBorder + "20"
          : c.amber + "10",
      opacity: isUsed ? 0.55 : 1,
    },
    stripeDivider: {
      position: "absolute",
      right: 0,
      top: "15%",
      bottom: "15%",
      width: 1,
      backgroundColor: c.cardBorder,
    },
    stripeEmoji: {
      fontSize: 20,
    },

    // Body
    body: {
      flex: 1,
      paddingVertical: 13,
      paddingLeft: 14,
      paddingRight: 12,
      opacity: isUsed || isExpired ? 0.55 : 1,
      gap: 0,
    },
    title: {
      color: c.white,
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 3,
    },
    partner: {
      color: c.textSubtle,
      fontSize: 11,
      marginBottom: 9,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    // Status pill
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 3,
      paddingHorizontal: 9,
      borderRadius: 20,
    },
    pillDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
    },
    pillText: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.3,
    },

    expiry: {
      color: c.textSubtle,
      fontSize: 10,
    },

    // Code block (active only)
    codeBlock: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      alignItems: "flex-end",
      justifyContent: "center",
      flexShrink: 0,
    },
    codeLabel: {
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 1.2,
      color: c.textSubtle,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    codeValue: {
      fontSize: 12,
      fontWeight: "800",
      color: c.amber,
      fontVariant: ["tabular-nums"],
      backgroundColor: c.amber + "12",
      paddingVertical: 4,
      paddingHorizontal: 9,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: c.amber + "25",
      overflow: "hidden",
    },
  }));

  return (
    <View style={styles.card}>
      {/* Left stripe */}
      <View style={styles.stripe}>
        <Text style={styles.stripeEmoji}>{statusEmoji}</Text>
        <View style={styles.stripeDivider} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {coupon.reward.title}
        </Text>
        <Text style={styles.partner}>{coupon.reward.partner.name}</Text>

        <View style={styles.metaRow}>
          {/* Status pill */}
          <View style={[styles.pill, { backgroundColor: statusColor + "15" }]}>
            <View style={[styles.pillDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.pillText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>

          {isActive && coupon.expiresAt && (
            <Text style={styles.expiry}>
              Expire {dayjs(coupon.expiresAt).format("DD MMM")}
            </Text>
          )}
        </View>
      </View>

      {/* Code block (active coupons only) */}
      {isActive && (
        <View style={styles.codeBlock}>
          <Text style={styles.codeLabel}>Code</Text>
          <Text style={styles.codeValue}>{coupon.code}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function RewardsScreen() {
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const { data: profileData } = useJambaarProfile();

  // ─── RÉCUPÉRATION DES DONNées ET ERREURS ────────────────────
  const {
    data: rewards,
    isLoading: rewardsLoading,
    isError: isRewardsError,
    error: rewardsError,
    refetch: refetchRewards,
  } = useRewards();
  const {
    data: couponsData,
    isLoading: couponsLoading,
    isError: isCouponsError,
    error: couponsError,
    refetch: refetchCoupons,
  } = useMyCoupons();
  const { mutateAsync: redeemReward, isPending: isRedeeming } =
    useRedeemReward();

  const hasRewardsNetworkError = isRewardsError && isNetworkError(rewardsError);
  const hasCouponsNetworkError = isCouponsError && isNetworkError(couponsError);

  const [activeTab, setActiveTab] = useState<TabType>("catalogue");
  const [couponFilter, setCouponFilter] = useState<CouponFilter>("ACTIVE");

  const totalPoints =
    profileData?.profile.totalPoints ?? user?.jambaarsProfile?.totalPoints ?? 0;
  const filteredCoupons =
    couponsData?.coupons.filter((c) => c.status === couponFilter) ?? [];

  const handleRedeem = async (rewardId: string) => {
    Alert.alert(
      "Confirmer l'échange ?",
      "Les points seront débités de votre solde Jambaar et un coupon sera généré.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Échanger",
          style: "destructive",
          onPress: async () => {
            try {
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              await redeemReward(rewardId);
              Alert.alert("Succès", "Votre coupon a été généré !");
            } catch (error: any) {
              const msg =
                error?.response?.data?.message ||
                "Impossible d'échanger vos points.";
              Alert.alert("Erreur", msg);
            }
          },
        },
      ],
    );
  };

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === "ios" ? 120 : 90,
    },
    topHalo: {
      position: "absolute",
      top: -60,
      left: "50%",
      marginLeft: -100,
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: c.amber + "06",
    },
    navHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 8,
      paddingBottom: 16,
      paddingHorizontal: 20,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    navTitle: {
      color: c.white,
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    balanceCard: {
      backgroundColor: c.cardBg,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.amber + "25",
      padding: 18,
      marginHorizontal: 20,
      marginBottom: 20,
      overflow: "hidden",
      position: "relative",
    },
    balanceHalo: {
      position: "absolute",
      top: -30,
      right: -30,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: c.amber + "08",
    },
    balanceTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    balanceLabel: { color: c.textMuted, fontSize: 12, fontWeight: "600" },
    balanceRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
    balanceValue: {
      color: c.amber,
      fontSize: 36,
      fontWeight: "900",
      letterSpacing: -1.5,
    },
    balanceUnit: { color: c.textMuted, fontSize: 16, fontWeight: "700" },
    tabRow: {
      flexDirection: "row",
      marginHorizontal: 20,
      marginBottom: 20,
      backgroundColor: c.cardBg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.cardBorder,
      padding: 4,
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 10,
      borderRadius: 10,
    },
    tabActive: { backgroundColor: c.amber + "12" },
    tabText: { color: c.textMuted, fontSize: 13, fontWeight: "600" },
    tabTextActive: { color: c.white, fontWeight: "700" },
    couponsContainer: { flex: 1 },
    filterRow: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    filterPill: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.cardBorder,
      backgroundColor: c.cardBg,
    },
    filterActive: {
      backgroundColor: c.amber + "12",
      borderColor: c.amber + "35",
    },
    filterText: { color: c.textMuted, fontSize: 12, fontWeight: "600" },
    filterTextActive: { color: c.white, fontWeight: "700" },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 60,
      gap: 12,
    },
    emptyTitle: { color: c.textMuted, fontSize: 14, fontWeight: "600" },
  }));

  const goBack = useSmartBack({
    defaultRoute: "/(donor)/jambaar", // Par défaut, retour au hub Jambaar
    routeMap: {
      jambaar: "/(donor)/jambaar",
      profile: "/(donor)/profile",
      settings: "/(donor)/profile/settings",
    },
  });

  // ── Logique de rendu des onglets ──────────────────────────────

  const renderCatalogueContent = () => {
    if (rewardsLoading && !rewards) return <RewardsSkeleton colors={colors} />;
    if (hasRewardsNetworkError && !rewards)
      return <NetworkErrorScreen onRetry={refetchRewards} />;

    return (
      <FlatList
        data={rewards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RewardCard
            reward={item}
            userPoints={totalPoints}
            onRedeem={handleRedeem}
            isRedeeming={isRedeeming}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshing={rewardsLoading && !!rewards}
        onRefresh={refetchRewards}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="gift-outline" size={40} color={colors.textSubtle} />
            <Text style={styles.emptyTitle}>Aucune récompense disponible</Text>
          </View>
        }
      />
    );
  };

  const renderCouponsContent = () => {
    if (couponsLoading && !couponsData)
      return <CouponsSkeleton colors={colors} />;
    if (hasCouponsNetworkError && !couponsData)
      return <NetworkErrorScreen onRetry={refetchCoupons} />;

    return (
      <View style={styles.couponsContainer}>
        <View style={styles.filterRow}>
          {(["ACTIVE", "USED", "EXPIRED"] as CouponFilter[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterPill,
                couponFilter === filter && styles.filterActive,
              ]}
              onPress={() => setCouponFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  couponFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter === "ACTIVE"
                  ? "Actifs"
                  : filter === "USED"
                    ? "Utilisés"
                    : "Expirés"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredCoupons}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CouponCard coupon={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshing={couponsLoading && !!couponsData}
          onRefresh={refetchCoupons}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="ticket-outline"
                size={40}
                color={colors.textSubtle}
              />
              <Text style={styles.emptyTitle}>
                Aucun coupon dans cette catégorie
              </Text>
            </View>
          }
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topHalo} />

      {/* Header Nav */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.backBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={19} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>
          Boutique <Text style={{ color: colors.amber }}>Jambaar</Text>
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Carte Solde Points */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHalo} />
        <View style={styles.balanceTop}>
          <Ionicons name="wallet-outline" size={18} color={colors.amber} />
          <Text style={styles.balanceLabel}>Votre solde</Text>
        </View>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceValue}>
            {totalPoints.toLocaleString()}
          </Text>
          <Text style={styles.balanceUnit}>pts</Text>
        </View>
      </View>

      {/* Tabs Switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "catalogue" && styles.tabActive]}
          onPress={() => setActiveTab("catalogue")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="gift-outline"
            size={16}
            color={activeTab === "catalogue" ? colors.white : colors.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "catalogue" && styles.tabTextActive,
            ]}
          >
            Catalogue
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "coupons" && styles.tabActive]}
          onPress={() => setActiveTab("coupons")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="ticket-outline"
            size={16}
            color={activeTab === "coupons" ? colors.white : colors.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "coupons" && styles.tabTextActive,
            ]}
          >
            Mes Coupons
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === "catalogue"
        ? renderCatalogueContent()
        : renderCouponsContent()}
    </SafeAreaView>
  );
}
