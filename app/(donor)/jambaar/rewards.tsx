import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import dayjs from "dayjs";
import { useAuthStore } from "@/src/store/auth.store";
import { useJambaarProfile } from "@/src/hooks/useJambaar";
import {
  useMyCoupons,
  useRedeemReward,
} from "@/src/hooks/useCoupons";
import { Coupon, Reward } from "@/src/types/domain.types";
import { useRewards } from "@/src/hooks/useRewards";

// ─── Palette ──────────────────────────────────────────────────
const COLORS = {
  bg: "#080808",
  cardBg: "#111111",
  cardBorder: "rgba(255,255,255,0.08)",
  red: "#DC1E1E",
  green: "#1D9E75",
  amber: "#FAC775",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.45)",
  textSubtle: "rgba(255,255,255,0.18)",
  lockedBg: "rgba(255,255,255,0.03)",
  lockedBorder: "rgba(255,255,255,0.05)",
} as const;

type TabType = "catalogue" | "coupons";
type CouponFilter = "ACTIVE" | "USED" | "EXPIRED";

// ─── Composant Reward Card ────────────────────────────────────
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
  const canAfford = userPoints >= reward.pointsCost;
  const pointsNeeded = reward.pointsCost - userPoints;
  const progressPct = Math.min((userPoints / reward.pointsCost) * 100, 100);

  return (
    <View style={styles.rewardCard}>
      <View style={styles.partnerRow}>
        <View style={styles.partnerIcon}>
          <Ionicons
            name="business-outline"
            size={14}
            color={COLORS.textMuted}
          />
        </View>
        <Text style={styles.partnerName} numberOfLines={1}>
          {reward.partner.name}
        </Text>
      </View>

      <Text style={styles.rewardTitle} numberOfLines={2}>
        {reward.title}
      </Text>
      <Text style={styles.rewardDesc} numberOfLines={2}>
        {reward.description}
      </Text>

      <View style={styles.costBlock}>
        <View style={styles.costRow}>
          <Text
            style={[
              styles.costValue,
              { color: canAfford ? COLORS.green : COLORS.amber },
            ]}
          >
            {reward.pointsCost} pts
          </Text>
          {!canAfford && (
            <Text style={styles.missingText}>-{pointsNeeded} pts</Text>
          )}
        </View>
        <View style={styles.costBarBg}>
          <View
            style={[
              styles.costBarFill,
              {
                width: `${progressPct}%`,
                backgroundColor: canAfford ? COLORS.green : COLORS.amber,
              },
            ]}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.redeemBtn,
          canAfford ? styles.redeemActive : styles.redeemLocked,
        ]}
        onPress={() => canAfford && onRedeem(reward.id)}
        activeOpacity={canAfford ? 0.8 : 1}
        disabled={!canAfford || isRedeeming}
      >
        {isRedeeming ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : canAfford ? (
          <>
            <Ionicons name="gift-outline" size={16} color={COLORS.white} />
            <Text style={styles.redeemText}>Échanger</Text>
          </>
        ) : (
          <>
            <Ionicons
              name="lock-closed-outline"
              size={14}
              color={COLORS.textSubtle}
            />
            <Text style={styles.redeemTextLocked}>Points insuffisants</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Composant Coupon Card ────────────────────────────────────
function CouponCard({ coupon }: { coupon: Coupon }) {
  const isActive = coupon.status === "ACTIVE";
  const isUsed = coupon.status === "USED";
  const statusColor = isActive
    ? COLORS.green
    : isUsed
      ? COLORS.textMuted
      : COLORS.amber;
  const statusLabel = isActive ? "Actif" : isUsed ? "Utilisé" : "Expiré";

  return (
    <View style={[styles.couponCard, isActive && styles.couponActive]}>
      <View
        style={[styles.couponStripe, { backgroundColor: statusColor + "30" }]}
      >
        <Text style={[styles.couponTypeIcon, { color: statusColor }]}>
          {isActive ? "🎫" : isUsed ? "✅" : "⏳"}
        </Text>
      </View>

      <View style={styles.couponContent}>
        <Text style={styles.couponTitle} numberOfLines={1}>
          {coupon.reward.title}
        </Text>
        <Text style={styles.couponPartner}>{coupon.reward.partner.name}</Text>
        <View style={styles.couponMeta}>
          <View
            style={[
              styles.couponStatusPill,
              {
                backgroundColor: statusColor + "15",
                borderColor: statusColor + "30",
              },
            ]}
          >
            <Text style={[styles.couponStatusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
          {isActive && coupon.expiresAt && (
            <Text style={styles.couponExpiry}>
              Expire {dayjs(coupon.expiresAt).format("DD MMM")}
            </Text>
          )}
        </View>
      </View>

      {isActive && (
        <View style={styles.couponCodeBlock}>
          <Text style={styles.couponCodeLabel}>CODE</Text>
          <Text style={styles.couponCodeValue}>{coupon.code}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function RewardsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: profileData } = useJambaarProfile();
  const { data: rewards, isLoading: rewardsLoading } = useRewards();
  const { data: couponsData, isLoading: couponsLoading } = useMyCoupons();
  const { mutateAsync: redeemReward, isPending: isRedeeming } =
    useRedeemReward();

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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topHalo} />

      {/* Header Nav */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={19} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>
          Boutique <Text style={{ color: COLORS.amber }}>Jambaar</Text>
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Carte Solde Points */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHalo} />
        <View style={styles.balanceTop}>
          <Ionicons name="wallet-outline" size={18} color={COLORS.amber} />
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
            color={activeTab === "catalogue" ? COLORS.white : COLORS.textMuted}
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
            color={activeTab === "coupons" ? COLORS.white : COLORS.textMuted}
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
      {activeTab === "catalogue" ? (
        rewardsLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={COLORS.amber} size="large" />
          </View>
        ) : (
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
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons
                  name="gift-outline"
                  size={40}
                  color={COLORS.textSubtle}
                />
                <Text style={styles.emptyTitle}>
                  Aucune récompense disponible
                </Text>
              </View>
            }
          />
        )
      ) : (
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

          {couponsLoading ? (
            <ActivityIndicator
              color={COLORS.amber}
              size="large"
              style={{ marginTop: 40 }}
            />
          ) : (
            <FlatList
              data={filteredCoupons}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <CouponCard coupon={item} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons
                    name="ticket-outline"
                    size={40}
                    color={COLORS.textSubtle}
                  />
                  <Text style={styles.emptyTitle}>
                    Aucun coupon dans cette catégorie
                  </Text>
                </View>
              }
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
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
    backgroundColor: "rgba(250,199,117,0.06)",
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
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  balanceCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(250,199,117,0.25)",
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
    backgroundColor: "rgba(250,199,117,0.08)",
  },
  balanceTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  balanceLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: "600" },
  balanceRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  balanceValue: {
    color: COLORS.amber,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  balanceUnit: { color: COLORS.textMuted, fontSize: 16, fontWeight: "700" },
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
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
  tabActive: { backgroundColor: "rgba(250,199,117,0.12)" },
  tabText: { color: COLORS.textMuted, fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: COLORS.white, fontWeight: "700" },
  rewardCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  partnerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  partnerIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  partnerName: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
  rewardTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  rewardDesc: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },
  costBlock: { gap: 6 },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  costValue: { fontSize: 14, fontWeight: "800" },
  missingText: { color: COLORS.textSubtle, fontSize: 11, fontWeight: "600" },
  costBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  costBarFill: { height: "100%", borderRadius: 2 },
  redeemBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  redeemActive: { backgroundColor: COLORS.green },
  redeemLocked: {
    backgroundColor: COLORS.lockedBg,
    borderWidth: 1,
    borderColor: COLORS.lockedBorder,
  },
  redeemText: { color: COLORS.white, fontSize: 13, fontWeight: "700" },
  redeemTextLocked: {
    color: COLORS.textSubtle,
    fontSize: 12,
    fontWeight: "600",
  },
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
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBg,
  },
  filterActive: {
    backgroundColor: "rgba(250,199,117,0.12)",
    borderColor: "rgba(250,199,117,0.35)",
  },
  filterText: { color: COLORS.textMuted, fontSize: 12, fontWeight: "600" },
  filterTextActive: { color: COLORS.white, fontWeight: "700" },
  couponCard: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    overflow: "hidden",
  },
  couponActive: { borderWidth: 1.5, borderColor: "rgba(29,158,117,0.30)" },
  couponStripe: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    flexShrink: 0,
  },
  couponTypeIcon: { fontSize: 20 },
  couponContent: { flex: 1, gap: 4 },
  couponTitle: { color: COLORS.white, fontSize: 14, fontWeight: "700" },
  couponPartner: { color: COLORS.textMuted, fontSize: 11 },
  couponMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  couponStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  couponStatusText: { fontSize: 10, fontWeight: "700" },
  couponExpiry: { color: COLORS.textSubtle, fontSize: 10 },
  couponCodeBlock: {
    alignItems: "flex-end",
    justifyContent: "center",
    flexShrink: 0,
  },
  couponCodeLabel: {
    color: COLORS.textSubtle,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1,
  },
  couponCodeValue: { color: COLORS.amber, fontSize: 11, fontWeight: "800" },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyTitle: { color: COLORS.textMuted, fontSize: 14, fontWeight: "600" },
});
