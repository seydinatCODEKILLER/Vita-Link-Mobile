import { useThemedStyles } from "@/src/theme/useTheme";

/**
 * Styles statiques de l'écran CreateAlertScreen
 * (hors sous-composants qui ont leurs propres styles).
 */
export function useCreateAlertStyles() {
  return useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    safeArea: { flex: 1 },
    haloTop: {
      position: "absolute",
      top: -100,
      right: -80,
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor: c.redGlow,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 16,
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
    headerTitle: { color: c.white, fontSize: 20, fontWeight: "800" },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingTop: 10 },
    fieldLabel: {
      color: c.white,
      fontSize: 13,
      fontWeight: "600",
      letterSpacing: 0.3,
      opacity: 0.75,
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 24,
      paddingTop: 16,
      backgroundColor: c.bg + "D9",
    },
    ctaBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: c.red,
      borderRadius: 16,
      paddingVertical: 17,
    },
    ctaBtnDisabled: { opacity: 0.6, backgroundColor: c.red + "66" },
    ctaBtnText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.2,
    },
    ctaBtnTextDisabled: { color: "rgba(255,255,255,0.5)" },
  }));
}
