import { Platform } from "react-native";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";

/**
 * Styles statiques de la tab bar et des éléments
 * périphériques du HealthLayout (alertOverlay, moreButton…).
 */
export function useTabStyles(tabBarHeight: number, safeBottom: number) {
  const colors = useColors();

  const styles = useThemedStyles((c) => ({
    container: {
      flex: 1,
      backgroundColor: c.bg,
    },
    tabBar: {
      backgroundColor: "transparent",
      borderTopWidth: 0.5,
      borderTopColor: c.cardBorder + "40",
      paddingTop: 6,
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      elevation: 0,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    tabBarBg: {
      position: "absolute",
      inset: 0,
      backgroundColor: c.cardBg + "F5",
    },
    tabLabel: {
      fontSize: 10.5,
      fontWeight: "600",
      letterSpacing: 0.2,
      marginTop: 2,
    },
    tabItem: {
      paddingTop: 4,
      paddingBottom: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    alertOverlay: {
      position: "absolute",
      top: Platform.OS === "ios" ? 56 : 44,
      left: 0,
      right: 0,
      zIndex: 9999,
      pointerEvents: "box-none",
    },
    moreButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 4,
      paddingBottom: 2,
    },
    moreIconWrapper: {
      height: 22,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 2,
    },
    moreDots: {
      flexDirection: "row" as const,
      gap: 3.5,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },
    moreDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
    },
  }));

  return { styles, colors };
}
