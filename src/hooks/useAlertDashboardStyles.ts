import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";

/**
 * Styles statiques de l'écran AlertDashboardScreen.
 * tabBarHeight est sorti de la factory useThemedStyles pour éviter
 * la closure et garder les styles purs.
 */
export function useAlertDashboardStyles() {
  const tabBarHeight = useBottomTabBarHeight();
  const colors = useColors();

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    centered: { alignItems: "center", justifyContent: "center" },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 },

    // Alert Header
    alertHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: c.cardBg,
      borderRadius: 18,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 16,
    },
    bloodBadge: {
      width: 52,
      height: 52,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    bloodBadgeText: { color: c.white, fontSize: 18, fontWeight: "900" },
    alertInfo: { flex: 1, gap: 4 },
    alertTitle: { color: c.white, fontSize: 18, fontWeight: "800" },
    alertSub: { color: c.textMuted, fontSize: 13 },

    // Closed Banner
    closedBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: c.cardBg,
      borderRadius: 13,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 13,
    },
    closedBannerText: { fontSize: 13, fontWeight: "600" },

    // Responses list
    listHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
    },
    listTitle: {
      color: c.textSubtle,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1.5,
    },
    responsesList: {
      backgroundColor: c.cardBg,
      borderRadius: 18,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      overflow: "hidden",
    },
    emptyState: { alignItems: "center", padding: 40, gap: 12 },
    emptyText: { color: c.textSubtle, fontSize: 13, textAlign: "center" },

    // Footer
    footer: {
      paddingHorizontal: 24,
      paddingTop: 12,
      backgroundColor: c.bg,
      borderTopWidth: 0.5,
      borderTopColor: c.cardBorder,
    },
    closeBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      borderWidth: 0.5,
      borderColor: c.red + "4D",
      backgroundColor: c.red + "0D",
      borderRadius: 16,
      paddingVertical: 16,
    },
    closeBtnDisabled: {
      opacity: 0.4,
      backgroundColor: "transparent",
      borderColor: c.cardBorder,
    },
    closeBtnText: { color: c.red, fontSize: 16, fontWeight: "700" },

    // Error state
    errorText: { color: c.textMuted, fontSize: 16 },
    errorBack: {
      backgroundColor: c.red,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    errorBackText: { color: "#FFFFFF", fontWeight: "700" },
  }));

  return {
    styles,
    // Sorti de la factory pour éviter la closure sur tabBarHeight
    footerPaddingBottom: 12 + tabBarHeight,
    colors,
  };
}
