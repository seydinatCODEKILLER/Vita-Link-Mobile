import { useThemedStyles } from "@/src/theme/useTheme";

/**
 * Styles statiques de l'écran StockScreen
 * (hors modale, qui a ses propres styles dans UpdateStockModal).
 */
export function useStockScreenStyles() {
  return useThemedStyles((c) => ({
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
}
