import { useThemedStyles } from "@/src/theme/useTheme";

/**
 * Styles statiques de l'écran HealthAlertsScreen.
 */
export function useAlertsListStyles() {
  return useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    centered: { flex: 1, alignItems: "center", justifyContent: "center" },
    listContent: { paddingHorizontal: 20, paddingTop: 10 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 14,
    },
    eyebrow: {
      color: c.textSubtle,
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 1.5,
    },
    headerTitle: {
      color: c.white,
      fontSize: 24,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    createBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: c.red,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: c.red,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
    createBtnDisabled: { backgroundColor: c.cardBg, shadowOpacity: 0 },
    filtersRow: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    filterPill: {
      paddingVertical: 7,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.cardBorder,
      backgroundColor: c.cardBg,
    },
    filterPillActive: {
      backgroundColor: "rgba(220,30,30,0.12)",
      borderColor: "rgba(220,30,30,0.35)",
    },
    filterText: { color: c.textMuted, fontSize: 12, fontWeight: "600" },
    filterTextActive: { color: c.white },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 80,
      gap: 12,
      paddingHorizontal: 40,
    },
    emptyTitle: { color: c.white, fontSize: 18, fontWeight: "700" },
    emptySub: {
      color: c.textMuted,
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
    },
    loaderMore: { paddingVertical: 20, alignItems: "center" },
    fab: {
      position: "absolute",
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: c.red,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: c.red,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 14,
      elevation: 10,
    },
    fabDisabled: { backgroundColor: c.cardBg, shadowOpacity: 0 },
  }));
}