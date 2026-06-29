import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";

export function useBloodRequestDetailStyles() {
  const tabBarHeight = useBottomTabBarHeight();
  const colors = useColors();

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    navHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 12,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    navTitle: {
      color: c.white,
      fontSize: 17,
      fontWeight: "800",
      letterSpacing: -0.3,
      flex: 1,
    },
    infoCard: {
      marginHorizontal: 20,
      marginBottom: 12,
      borderRadius: 18,
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.cardBorder,
      overflow: "hidden",
    },
    infoSection: { padding: 16 },
    infoLabel: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.8,
      color: c.textSubtle,
      textTransform: "uppercase",
      marginBottom: 6,
    },
    infoValue: {
      color: c.white,
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 3,
    },
    infoSub: { color: c.textSubtle, fontSize: 12 },
    separator: {
      height: 1,
      backgroundColor: c.cardBorder,
      marginHorizontal: 16,
    },
    contextCard: {
      marginHorizontal: 20,
      marginBottom: 12,
      borderRadius: 14,
      backgroundColor: c.red + "08",
      borderWidth: 1,
      borderColor: c.red + "18",
      padding: 14,
    },
    notesCard: {
      marginHorizontal: 20,
      marginBottom: 12,
      borderRadius: 14,
      backgroundColor: c.success + "07",
      borderWidth: 1,
      borderColor: c.success + "18",
      padding: 14,
    },
    sectionTitle: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.9,
      textTransform: "uppercase",
      marginBottom: 7,
    },
    sectionText: {
      color: c.textMuted,
      fontSize: 13,
      lineHeight: 20,
    },
    cancelBtn: {
      marginHorizontal: 20,
      marginTop: 4,
      marginBottom: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: c.red + "0D",
      borderWidth: 1,
      borderColor: c.red + "28",
    },
    fab: {
      position: "absolute",
      right: 22,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 18,
      backgroundColor: c.red,
      shadowColor: c.red,
      shadowOpacity: 0.35,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
    emptyText: { color: c.white, textAlign: "center", marginTop: 40 },
  }));

  return {
    styles,
    colors,
    tabBarHeight,
  };
}
