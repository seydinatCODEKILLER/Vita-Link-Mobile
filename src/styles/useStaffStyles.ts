import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useThemedStyles } from "@/src/theme/useTheme";

export function useStaffStyles() {
  const tabBarHeight = useBottomTabBarHeight();

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    centered: { alignItems: "center", justifyContent: "center" },
    listContent: { paddingHorizontal: 20, paddingTop: 4 },
    // ← Padding dynamique centralisé
    listContentPadding: { paddingBottom: tabBarHeight + 80 },
    fabBottom: { bottom: tabBarHeight + 20 },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 14,
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
    headerTitle: { color: c.white, fontSize: 18, fontWeight: "800" },
    headerCount: { color: c.textMuted, fontSize: 11, fontWeight: "600" },
    pendingBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginHorizontal: 20,
      marginBottom: 12,
      backgroundColor: c.amber + "08",
      borderWidth: 0.5,
      borderColor: c.amber + "22",
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    pendingBannerText: {
      color: c.amber,
      fontSize: 12,
      fontWeight: "600",
      flex: 1,
    },
    sectionLabel: {
      color: c.textSubtle,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1.5,
      marginBottom: 10,
      marginTop: 6,
    },
    emptyState: {
      alignItems: "center",
      paddingTop: 60,
      gap: 12,
      paddingHorizontal: 20,
    },
    emptyTitle: { color: c.white, fontSize: 16, fontWeight: "700" },
    emptySub: {
      color: c.textMuted,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
    },
    fab: {
      position: "absolute",
      right: 22,
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: c.red,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: c.red,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.28,
      shadowRadius: 14,
      elevation: 10,
    },
    fabDisabled: {
      backgroundColor: c.cardBorder,
      shadowOpacity: 0,
      elevation: 0,
    },
  }));

  return { styles };
}
