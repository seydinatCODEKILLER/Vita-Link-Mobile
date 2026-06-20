import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";

export function useBloodRequestListStyles() {
  const tabBarHeight = useBottomTabBarHeight();
  const colors = useColors();

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 },
    headerTitle: {
      color: c.white,
      fontSize: 26,
      fontWeight: "900",
      letterSpacing: -0.6,
      lineHeight: 30,
    },
    headerSub: {
      color: c.textSubtle,
      fontSize: 12,
      marginTop: 4,
    },
    separator: {
      height: 1,
      backgroundColor: c.cardBorder,
      marginHorizontal: 20,
      marginBottom: 16,
      marginTop: 6,
      opacity: 0.5,
    },
    filterBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
    },
    filterText: {
      fontSize: 12,
      fontWeight: "500",
    },
    emptyContainer: {
      alignItems: "center",
      paddingTop: 70,
      gap: 12,
    },
    emptyIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    emptyTitle: {
      color: c.white,
      fontSize: 17,
      fontWeight: "700",
    },
    emptySub: {
      color: c.textMuted,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
      maxWidth: 240,
    },
  }));

  return {
    styles,
    colors,
    tabBarHeight,
  };
}
