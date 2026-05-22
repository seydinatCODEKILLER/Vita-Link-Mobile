import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useMyStocks, useUpdateMyStock } from "@/src/hooks/useBloodStocks";
import { BloodType, BloodStockLevel } from "@/src/types/shared.types";
import { useIsStructurePending } from "@/src/hooks/useIsStructurePending";

// ─── Palette ──────────────────────────────────────────────────
const COLORS = {
  bg: "#080808",
  cardBg: "#111111",
  cardBorder: "rgba(255,255,255,0.07)",
  red: "#DC1E1E",
  orange: "#F97316",
  green: "#1D9E75",
  blue: "#3B82F6",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.42)",
  textSubtle: "rgba(255,255,255,0.16)",
  inputBg: "#141414",
  inputBorder: "rgba(255,255,255,0.09)",
} as const;

// ─── Config Groupes Sanguins ──────────────────────────────────
const BLOOD_TYPES_CONFIG: {
  value: BloodType;
  label: string;
  isRare?: boolean;
}[] = [
  { value: "A_POS", label: "A+" },
  { value: "A_NEG", label: "A−", isRare: true },
  { value: "B_POS", label: "B+" },
  { value: "B_NEG", label: "B−", isRare: true },
  { value: "AB_POS", label: "AB+" },
  { value: "AB_NEG", label: "AB−", isRare: true },
  { value: "O_POS", label: "O+" },
  { value: "O_NEG", label: "O−", isRare: true },
];

// ─── Config Niveaux de Stock ──────────────────────────────────
const STOCK_LEVEL_CONFIG: Record<
  BloodStockLevel,
  {
    color: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
  }
> = {
  CRITICAL: {
    color: COLORS.red,
    icon: "alert-circle-outline",
    label: "Critique",
  },
  LOW: { color: COLORS.orange, icon: "trending-down-outline", label: "Bas" },
  ADEQUATE: {
    color: COLORS.green,
    icon: "checkmark-circle-outline",
    label: "Adéquat",
  },
  SURPLUS: { color: COLORS.blue, icon: "add-circle-outline", label: "Surplus" },
};

// ─── StockCard ────────────────────────────────────────────────
function StockCard({
  stock,
  onPress,
}: {
  stock: { bloodType: BloodType; quantity: number; level: BloodStockLevel };
  onPress: () => void;
}) {
  const config = BLOOD_TYPES_CONFIG.find((b) => b.value === stock.bloodType);
  const lvlConfig = STOCK_LEVEL_CONFIG[stock.level];
  const progressPct = Math.min((stock.quantity / 20) * 100, 100);

  return (
    <TouchableOpacity
      style={[styles.stockCard, { borderColor: lvlConfig.color + "22" }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[styles.cardGlow, { backgroundColor: lvlConfig.color + "18" }]}
      />
      <View style={styles.cardHeader}>
        <Text style={styles.bloodLabel}>{config?.label}</Text>
        <View
          style={[
            styles.levelChip,
            { backgroundColor: lvlConfig.color + "15" },
          ]}
        >
          <Ionicons name={lvlConfig.icon} size={14} color={lvlConfig.color} />
        </View>
      </View>
      {config?.isRare && (
        <View style={styles.rareBadge}>
          <Text style={styles.rareBadgeText}>Rare</Text>
        </View>
      )}
      <Text style={styles.quantityText}>{stock.quantity}</Text>
      <Text style={[styles.levelLabel, { color: lvlConfig.color }]}>
        {lvlConfig.label}
      </Text>
      <View style={styles.barBg}>
        <View
          style={[
            styles.barFill,
            {
              width: `${progressPct}%` as any,
              backgroundColor: lvlConfig.color,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

// ─── Écran Principal ───────────────────────────────────────────
export default function StockScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const isPending = useIsStructurePending();

  const { data: stocks, isLoading } = useMyStocks();
  const { mutateAsync: updateStock, isPending: isUpdating } =
    useUpdateMyStock();

  const [selectedBloodType, setSelectedBloodType] = useState<BloodType | null>(
    null,
  );
  const [inputQuantity, setInputQuantity] = useState("");

  const handleOpenModal = (bloodType: BloodType, currentQty: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBloodType(bloodType);
    setInputQuantity(currentQty.toString());
  };

  const handleUpdateStock = async () => {
    if (!selectedBloodType || inputQuantity === "") return;

    const qty = parseInt(inputQuantity, 10);
    if (isNaN(qty) || qty < 0 || qty > 500) {
      Alert.alert("Invalide", "La quantité doit être entre 0 et 500.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await updateStock({ bloodType: selectedBloodType, quantity: qty });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSelectedBloodType(null);
    } catch (error: any) {
      Alert.alert(
        "Erreur",
        error?.response?.data?.message || "Mise à jour échouée.",
      );
    }
  };

  // ── Structure en attente ──
  if (isPending) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="time-outline" size={64} color={COLORS.textSubtle} />
        <Text style={styles.pendingTitle}>Structure en attente</Text>
        <Text style={styles.pendingSub}>
          Votre structure doit être validée par nos équipes avant de pouvoir
          gérer les stocks de sang.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={COLORS.red} size="large" />
      </View>
    );
  }

  const stockMap = new Map(stocks?.map((s) => [s.bloodType, s]));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>
              Stocks de <Text style={{ color: COLORS.red }}>Sang</Text>
            </Text>
            <View style={styles.liveRow}>
              <View style={styles.liveDot} />
              <Text style={styles.headerSub}>Mise à jour en temps réel</Text>
            </View>
          </View>
        </View>

        {/* ── Légende ── */}
        <View style={styles.legendRow}>
          {(
            Object.entries(STOCK_LEVEL_CONFIG) as [
              BloodStockLevel,
              (typeof STOCK_LEVEL_CONFIG)[BloodStockLevel],
            ][]
          ).map(([level, conf]) => (
            <View key={level} style={styles.legendItem}>
              <View
                style={[
                  styles.legendIconWrap,
                  { backgroundColor: conf.color + "15" },
                ]}
              >
                <Ionicons name={conf.icon} size={13} color={conf.color} />
              </View>
              <Text style={[styles.legendText, { color: conf.color }]}>
                {conf.label}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Grille ── */}
        <View style={styles.grid}>
          {BLOOD_TYPES_CONFIG.map((bt) => {
            const stock = stockMap.get(bt.value) ?? {
              bloodType: bt.value,
              quantity: 0,
              level: "CRITICAL" as BloodStockLevel,
            };
            return (
              <StockCard
                key={bt.value}
                stock={stock}
                onPress={() => handleOpenModal(bt.value, stock.quantity)}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* ── Modale Mise à jour ── */}
      <Modal visible={!!selectedBloodType} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.pullBar} />
            <Text style={styles.modalTitle}>Mettre à jour le stock</Text>
            <View style={styles.modalBloodBadge}>
              <Text style={styles.modalBloodText}>
                {
                  BLOOD_TYPES_CONFIG.find((b) => b.value === selectedBloodType)
                    ?.label
                }
              </Text>
            </View>
            <Text style={styles.modalLabel}>Nombre de poches disponibles</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              value={inputQuantity}
              onChangeText={setInputQuantity}
              maxLength={3}
              selectTextOnFocus
              placeholderTextColor={COLORS.textMuted}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setSelectedBloodType(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, isUpdating && styles.btnDisabled]}
                onPress={handleUpdateStock}
                disabled={isUpdating}
                activeOpacity={0.8}
              >
                {isUpdating ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.confirmBtnText}>Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },

  // Pending
  pendingTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    textAlign: "center",
  },
  pendingSub: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },

  // Header
  header: { marginBottom: 18 },
  headerTitle: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 5 },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.green,
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  headerSub: { color: COLORS.textMuted, fontSize: 12, fontWeight: "500" },

  // Légende
  legendRow: {
    flexDirection: "row",
    marginBottom: 18,
    backgroundColor: COLORS.cardBg,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    borderRadius: 13,
    overflow: "hidden",
  },
  legendItem: {
    flex: 1,
    alignItems: "center",
    gap: 5,
    paddingVertical: 11,
    borderRightWidth: 0.5,
    borderRightColor: COLORS.cardBorder,
  },
  legendIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  legendText: { fontSize: 10, fontWeight: "700" },

  // Grid
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  // Stock Card
  stockCard: {
    width: "48%",
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 15,
    gap: 8,
    position: "relative",
    overflow: "hidden",
  },
  cardGlow: {
    position: "absolute",
    top: -24,
    right: -24,
    width: 90,
    height: 90,
    borderRadius: 45,
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bloodLabel: { color: COLORS.white, fontSize: 22, fontWeight: "900" },
  levelChip: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rareBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(249,115,22,0.14)",
    borderWidth: 0.5,
    borderColor: "rgba(249,115,22,0.28)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  rareBadgeText: { color: COLORS.orange, fontSize: 9, fontWeight: "700" },
  quantityText: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
  },
  levelLabel: { fontSize: 11, fontWeight: "700" },
  barBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  barFill: { height: "100%", borderRadius: 2 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    padding: 24,
    paddingTop: 16,
    gap: 14,
    alignItems: "center",
  },
  pullBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.14)",
    marginBottom: 6,
  },
  modalTitle: { color: COLORS.white, fontSize: 17, fontWeight: "800" },
  modalBloodBadge: {
    backgroundColor: "rgba(220,30,30,0.12)",
    borderWidth: 0.5,
    borderColor: "rgba(220,30,30,0.30)",
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 10,
  },
  modalBloodText: { color: COLORS.red, fontSize: 22, fontWeight: "900" },
  modalLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "600",
    alignSelf: "flex-start",
  },
  modalInput: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 0.5,
    borderColor: COLORS.inputBorder,
    borderRadius: 13,
    padding: 16,
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "700",
    width: "100%",
    textAlign: "center",
  },
  modalActions: { flexDirection: "row", gap: 10, width: "100%", marginTop: 4 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 13,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
  },
  cancelBtnText: { color: COLORS.textMuted, fontSize: 14, fontWeight: "700" },
  confirmBtn: {
    flex: 1,
    backgroundColor: COLORS.red,
    paddingVertical: 14,
    borderRadius: 13,
    alignItems: "center",
  },
  confirmBtnText: { color: COLORS.white, fontSize: 14, fontWeight: "700" },
  btnDisabled: { opacity: 0.5 },
});
