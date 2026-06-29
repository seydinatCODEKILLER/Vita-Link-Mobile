import { useThemedStyles } from "@/src/theme/useTheme";

export function usePurchaseOrdersStyles() {
  return useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },

    // ── Header ──
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 16,
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
    headerTitle: { color: c.white, fontSize: 17, fontWeight: "700" },
    headerSub: { color: c.textMuted, fontSize: 11, fontWeight: "500" },
    scanBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: c.red,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 12,
    },
    scanBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },

    // ── Tabs ──
    tabsContainer: {
      flexDirection: "row",
      paddingHorizontal: 20,
      marginBottom: 16,
      gap: 8,
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 9,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.cardBorder,
      backgroundColor: c.cardBg,
    },
    tabActive: { backgroundColor: c.red + "1A", borderColor: c.red + "4D" },
    tabText: { fontSize: 11, fontWeight: "700", color: c.textMuted },
    tabTextActive: { color: c.red },

    // ── Error ──
    errorContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      gap: 12,
    },
    errorIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 18,
      backgroundColor: c.red + "14",
      borderWidth: 1,
      borderColor: c.red + "30",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    errorTitle: { color: c.white, fontSize: 16, fontWeight: "700" },
    errorText: {
      color: c.textMuted,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
    },
    retryBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: c.red,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 4,
    },
    retryBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  }));
}
