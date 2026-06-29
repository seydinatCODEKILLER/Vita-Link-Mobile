import { useThemedStyles } from "@/src/theme/useTheme";

/**
 * Styles statiques de l'écran HealthProfileScreen
 * (hors StructureHeroCard, qui a ses propres styles).
 */
export function useProfileStyles() {
  return useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    scrollContent: { paddingHorizontal: 20 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 8,
      paddingBottom: 22,
    },
    headerTitle: {
      color: c.white,
      fontSize: 27,
      fontWeight: "900",
      letterSpacing: -0.5,
    },
    section: { marginBottom: 18 },
    sectionTitle: {
      color: c.textSubtle,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1.5,
      marginBottom: 9,
    },
    card: {
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      overflow: "hidden",
    },
    sep: { height: 0.5, backgroundColor: c.cardBorder, marginLeft: 58 },
    actions: { marginTop: 6, gap: 10, alignItems: "center", paddingBottom: 20 },
    logoutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      width: "100%",
      paddingVertical: 14,
      borderRadius: 15,
      borderWidth: 0.5,
      borderColor: c.red + "30",
      backgroundColor: c.red + "0D",
    },
    logoutText: { color: c.red, fontSize: 15, fontWeight: "700" },
    versionText: {
      color: c.textSubtle,
      fontSize: 10,
      opacity: 0.5,
      marginTop: 4,
    },
    themeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 14,
      minHeight: 50,
    },
    themeIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.amber + "15",
    },
    themeLabel: { color: c.white, fontSize: 14, fontWeight: "500" },
    themeHint: { color: c.textMuted, fontSize: 11 },
  }));
}
