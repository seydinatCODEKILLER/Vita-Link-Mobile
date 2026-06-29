import { useThemedStyles } from "@/src/theme/useTheme";

/**
 * Styles statiques de l'écran AlertDetailScreen
 * (hors composants isolés qui ont leurs propres styles).
 */
export function useAlertDetailStyles() {
  return useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    centered: { alignItems: "center", justifyContent: "center", gap: 12 },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
    notFoundText: { color: c.textMuted, fontSize: 15, marginTop: 8 },

    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 10,
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
    headerTitle: { color: c.white, fontSize: 18, fontWeight: "800" },

    // Hero Card
    heroCard: {
      backgroundColor: c.cardBg,
      borderRadius: 20,
      borderWidth: 0.5,
      padding: 18,
      gap: 14,
      overflow: "hidden",
      position: "relative",
    },
    heroGlow: {
      position: "absolute",
      top: -30,
      right: -30,
      width: 120,
      height: 120,
      borderRadius: 60,
      opacity: 0.6,
    },
    heroTop: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
    bloodBadge: {
      width: 58,
      height: 58,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    bloodBadgeText: { color: c.white, fontSize: 20, fontWeight: "900" },
    heroInfo: { flex: 1, gap: 5 },
    hospitalName: {
      color: c.white,
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: -0.2,
    },
    serviceUnit: {
      color: c.textMuted,
      fontSize: 13,
      textTransform: "capitalize",
    },
    vitalPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      alignSelf: "flex-start",
      backgroundColor: "rgba(220,30,30,0.13)",
      borderWidth: 0.5,
      borderColor: "rgba(220,30,30,0.35)",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 7,
      marginTop: 2,
    },
    vitalPillText: {
      color: c.red,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 10,
      borderRadius: 11,
    },
    statusActive: {
      backgroundColor: c.success + "12",
      borderWidth: 0.5,
      borderColor: c.success + "33",
    },
    statusExpired: {
      backgroundColor: c.amber + "12",
      borderWidth: 0.5,
      borderColor: c.amber + "33",
    },
    statusClosed: {
      backgroundColor: c.cardBg,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
    },
    statusDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
    statusText: { fontSize: 12, fontWeight: "700" },

    // Info Grid
    infoGrid: { flexDirection: "row", gap: 9 },
    infoCard: {
      flex: 1,
      backgroundColor: c.cardBg,
      borderRadius: 14,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 14,
      gap: 6,
    },
    infoIcon: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    infoLabel: {
      color: c.textMuted,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    infoValueRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
    infoValue: {
      color: c.white,
      fontSize: 18,
      fontWeight: "900",
      letterSpacing: -0.3,
    },
    infoUnit: { color: c.textMuted, fontSize: 11, fontWeight: "600" },

    // Progress
    progressCard: {
      backgroundColor: c.cardBg,
      borderRadius: 14,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 15,
      gap: 10,
    },
    progressHead: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    progressLabel: { color: c.textMuted, fontSize: 12, fontWeight: "600" },
    progressCount: { fontSize: 14, fontWeight: "800" },
    progressBg: { height: 6, borderRadius: 3, backgroundColor: c.cardBorder },
    progressFill: { height: "100%", borderRadius: 3 },
    progressSub: { color: c.textMuted, fontSize: 11, fontWeight: "500" },

    // Dashboard Button
    dashboardBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: c.red,
      paddingVertical: 15,
      paddingHorizontal: 18,
      borderRadius: 16,
    },
    dashboardBtnIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    dashboardBtnText: {
      flex: 1,
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },

    // Closed Card
    closedCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 15,
    },
    closedIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.success + "1A",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    closedTitle: { color: c.white, fontSize: 14, fontWeight: "700" },
    closedSub: { color: c.textMuted, fontSize: 12, lineHeight: 18 },
  }));
}
