import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useMyStocks, useUpdateMyStock } from "@/src/hooks/useBloodStocks";
import { BloodType, BloodStockLevel } from "@/src/types/shared.types";
import { useIsStructurePending } from "@/src/hooks/useIsStructurePending";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { AppColors } from "@/src/theme/colors";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { isNetworkError } from "@/src/utils/error.utils";

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

// ─── Config Niveaux de Stock (Dynamique) ──────────────────────
const getStockLevelConfig = (
  colors: AppColors,
): Record<
  BloodStockLevel,
  {
    color: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
  }
> => ({
  CRITICAL: {
    color: colors.red,
    icon: "alert-circle-outline",
    label: "Critique",
  },
  LOW: { color: "#F97316", icon: "trending-down-outline", label: "Bas" },
  ADEQUATE: {
    color: colors.success,
    icon: "checkmark-circle-outline",
    label: "Adéquat",
  },
  SURPLUS: { color: "#3B82F6", icon: "add-circle-outline", label: "Surplus" },
});

// ─── StockCard ────────────────────────────────────────────────
function StockCard({
  stock,
  onPress,
}: {
  stock: { bloodType: BloodType; quantity: number; level: BloodStockLevel };
  onPress: () => void;
}) {
  const colors = useColors();
  const STOCK_LEVEL_CONFIG = getStockLevelConfig(colors);

  const config = BLOOD_TYPES_CONFIG.find((b) => b.value === stock.bloodType);
  const lvlConfig = STOCK_LEVEL_CONFIG[stock.level];

  const progressPct = Math.min((stock.quantity / 50) * 100, 100);

  const styles = useThemedStyles((c) => ({
    stockCard: {
      width: "48%",
      backgroundColor: c.cardBg,
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
    bloodLabel: { color: c.white, fontSize: 22, fontWeight: "900" },
    levelChip: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    rareBadge: {
      alignSelf: "flex-start",
      backgroundColor: "#F9731614",
      borderWidth: 0.5,
      borderColor: "#F9731628",
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 5,
    },
    rareBadgeText: { color: "#F97316", fontSize: 9, fontWeight: "700" },
    quantityText: {
      color: c.white,
      fontSize: 32,
      fontWeight: "900",
      letterSpacing: -1,
    },
    levelLabel: { fontSize: 11, fontWeight: "700" },
    barBg: {
      height: 4,
      borderRadius: 2,
      backgroundColor: c.cardBorder,
    },
    barFill: { height: "100%", borderRadius: 2 },
  }));

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
              width: `${progressPct}%`,
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
  const colors = useColors();
  const tabBarHeight = useBottomTabBarHeight();
  const isPending = useIsStructurePending();
  const STOCK_LEVEL_CONFIG = getStockLevelConfig(colors);
  const insets = useSafeAreaInsets();

  const { data: stocks, isLoading, isError, error, refetch } = useMyStocks();
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
      // ✅ AMÉLIORATION : Gestion de l'erreur 403 (si un hôpital tente de modifier le stock)
      const errorMsg = error?.response?.data?.message || "Mise à jour échouée.";
      Alert.alert("Erreur", errorMsg);
    }
  };

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    centered: {
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: 24,
    },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
    pendingTitle: {
      color: c.white,
      fontSize: 18,
      fontWeight: "700",
      marginTop: 16,
      textAlign: "center",
    },
    pendingSub: {
      color: c.textMuted,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
    },
    header: { marginBottom: 18 },
    headerTitle: {
      color: c.white,
      fontSize: 26,
      fontWeight: "900",
      letterSpacing: -0.5,
    },
    liveRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 5,
    },
    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: c.success,
      shadowColor: c.success,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
      elevation: 4,
    },
    headerSub: { color: c.textMuted, fontSize: 12, fontWeight: "500" },
    legendRow: {
      flexDirection: "row",
      marginBottom: 18,
      backgroundColor: c.cardBg,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      borderRadius: 13,
      overflow: "hidden",
    },
    legendItem: {
      flex: 1,
      alignItems: "center",
      gap: 5,
      paddingVertical: 11,
      borderRightWidth: 0.5,
      borderRightColor: c.cardBorder,
    },
    legendIconWrap: {
      width: 26,
      height: 26,
      borderRadius: 7,
      alignItems: "center",
      justifyContent: "center",
    },
    legendText: { fontSize: 10, fontWeight: "700" },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.85)",
      justifyContent: "flex-end",
    },
    modalCard: {
      backgroundColor: c.cardBg,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 24,
      paddingTop: 16,
      paddingBottom: Math.max(24, tabBarHeight + insets.bottom),
      gap: 14,
      alignItems: "center",
    },
    pullBar: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.textSubtle,
      marginBottom: 6,
    },
    modalTitle: { color: c.white, fontSize: 17, fontWeight: "800" },
    modalBloodBadge: {
      backgroundColor: c.red + "12",
      borderWidth: 0.5,
      borderColor: c.red + "30",
      paddingHorizontal: 18,
      paddingVertical: 7,
      borderRadius: 10,
    },
    modalBloodText: { color: c.red, fontSize: 22, fontWeight: "900" },
    modalLabel: {
      color: c.textMuted,
      fontSize: 13,
      fontWeight: "600",
      alignSelf: "flex-start",
    },
    modalInput: {
      backgroundColor: c.inputBg,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      borderRadius: 13,
      padding: 16,
      color: c.white,
      fontSize: 20,
      fontWeight: "700",
      width: "100%",
      textAlign: "center",
    },
    modalActions: {
      flexDirection: "row",
      gap: 10,
      width: "100%",
      marginTop: 4,
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 13,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      alignItems: "center",
    },
    cancelBtnText: { color: c.textMuted, fontSize: 14, fontWeight: "700" },
    confirmBtn: {
      flex: 1,
      backgroundColor: c.red,
      paddingVertical: 14,
      borderRadius: 13,
      alignItems: "center",
    },
    confirmBtnText: { color: c.white, fontSize: 14, fontWeight: "700" },
    btnDisabled: { opacity: 0.5 },
    errorText: { color: c.textMuted, fontSize: 16, textAlign: "center" },
    errorBack: {
      backgroundColor: c.red,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 8,
    },
    errorBackText: { color: "#FFFFFF", fontWeight: "700" },
  }));

  // ── Structure en attente ──
  if (isPending) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="time-outline" size={64} color={colors.textSubtle} />
        <Text style={styles.pendingTitle}>Structure en attente</Text>
        <Text style={styles.pendingSub}>
          Votre CNTS doit être validée avant de pouvoir gérer les stocks.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.red} size="large" />
      </View>
    );
  }

  // ── Gestion robuste des erreurs ──
  if (isError) {
    if (isNetworkError(error)) {
      return (
        <View style={styles.container}>
          <NetworkErrorScreen onRetry={refetch} />
        </View>
      );
    }

    // Erreur API (403 si c'est un hôpital, 500, etc.)
    const errorMessage =
      (error as any)?.response?.data?.message ||
      "Impossible de charger les stocks. Vous n'avez peut-être pas les droits nécessaires.";

    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.red} />
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.errorBack}>
          <Text style={styles.errorBackText}>Réessayer</Text>
        </TouchableOpacity>
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
              Stocks de <Text style={{ color: colors.red }}>Sang</Text>
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
              placeholderTextColor={colors.textMuted}
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
                  <ActivityIndicator color={colors.white} size="small" />
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
