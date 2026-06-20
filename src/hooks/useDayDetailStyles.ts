import { useThemedStyles } from "@/src/theme/useTheme";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export function useDayDetailStyles() {
  const tabBarHeight = useBottomTabBarHeight();

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },

    // ── Header ──
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

    // ── Cover ──
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
    coverImage: { width: "100%", height: "100%" },

    // ── Infos ──
    infoSection: { paddingHorizontal: 20, paddingTop: 20, gap: 14 },
    title: {
      color: c.white,
      fontSize: 22,
      fontWeight: "700",
      letterSpacing: -0.3,
      lineHeight: 28,
    },
    metaContainer: { gap: 8 },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    metaText: { color: c.textMuted, fontSize: 13, fontWeight: "400" },
    bloodTypesContainer: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
    bloodPill: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: c.red + "08",
    },
    bloodPillText: { color: c.red, fontSize: 11, fontWeight: "600" },

    // ── Stats ──
    statsRow: { flexDirection: "row", gap: 8 },
    statCard: {
      flex: 1,
      backgroundColor: c.cardBg,
      borderRadius: 14,
      padding: 14,
      alignItems: "center",
      gap: 4,
    },
    statValue: { fontSize: 22, fontWeight: "700", letterSpacing: -0.5 },
    statLabel: { fontSize: 11, color: c.textMuted, fontWeight: "500" },
    separator: {
      height: 1,
      backgroundColor: c.cardBorder + "30",
      marginVertical: 8,
    },

    // ── Section & Filtres ──
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
    sectionCount: { color: c.textMuted, fontSize: 13, fontWeight: "500" },
    filtersScroll: { paddingHorizontal: 20, marginBottom: 16 },
    filtersRow: { flexDirection: "row", gap: 6 },
    filterChip: {
      paddingVertical: 7,
      paddingHorizontal: 14,
      borderRadius: 100,
      backgroundColor: c.cardBg,
    },
    filterChipActive: { backgroundColor: c.red + "10" },
    filterChipText: { color: c.textMuted, fontSize: 12, fontWeight: "500" },
    filterChipTextActive: { color: c.red, fontWeight: "600" },

    // ── FlatList Content (inclut le padding dynamique de la tab bar) ──
    flatListContent: {
      paddingBottom: tabBarHeight + 40,
    },

    // ── Cancel Button ──
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
    cancelButtonText: { color: c.red, fontSize: 14, fontWeight: "600" }, // ← Remplacement de #EF4444

    // ── Empty State ──
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

    // ── Modal ──
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
    modalTitle: { color: c.white, fontSize: 18, fontWeight: "700" },
    modalCloseBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.cardBorder + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    modalDescription: { color: c.textMuted, fontSize: 13, lineHeight: 20 },
    modalActions: { flexDirection: "row", gap: 10 },
    modalBtnSecondary: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: c.cardBorder + "20",
      alignItems: "center",
    },
    modalBtnSecondaryText: { color: c.white, fontWeight: "600", fontSize: 14 },
    modalBtnDanger: {
      flex: 1,
      flexDirection: "row",
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: c.red, // ← Remplacement de #EF4444
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    modalBtnDangerText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  }));

  return { styles }; // ← colors a été retiré
}
