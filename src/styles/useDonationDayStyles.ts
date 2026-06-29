import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";

export function useDonationDayStyles() {
  const tabBarHeight = useBottomTabBarHeight();
  const colors = useColors();

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    headerEyebrow: {
      color: c.textMuted,
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    headerTitle: {
      color: c.white,
      fontSize: 26,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    filterInactiveBorder: { borderColor: c.cardBorder },
    filterInactiveBg: { backgroundColor: c.cardBg },
    filterActiveBorder: { borderColor: c.red + "40" },
    filterActiveBg: { backgroundColor: c.red + "15" },
    filterDotInactive: { backgroundColor: c.textSubtle },
    filterTextInactive: { color: c.textMuted },
    emptyStateIconBg: {
      backgroundColor: c.red + "12",
      borderWidth: 1,
      borderColor: c.red + "20",
    },
    emptyStateTitle: {
      color: c.white,
      fontSize: 18,
      fontWeight: "700",
      textAlign: "center",
    },
    emptyStateSub: {
      color: c.textMuted,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
    },
  }));

  return {
    styles,
    colors,
    tabBarHeight,
  };
}
