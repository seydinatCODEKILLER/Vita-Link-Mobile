import { useThemedStyles } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";

export function useWelcomeStyles() {
  const isDark = useThemeStore((s) => s.theme) === "dark";

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: isDark ? "#0a0808" : "#fff5f5" },
    haloTop: {
      position: "absolute",
      top: -80,
      left: -60,
      width: 280,
      height: 260,
      borderRadius: 140,
      backgroundColor: isDark ? "rgba(200,20,20,0.16)" : "rgba(200,20,20,0.06)",
    },
    haloBottom: {
      position: "absolute",
      bottom: 100,
      right: -50,
      width: 220,
      height: 200,
      borderRadius: 110,
      backgroundColor: isDark ? "rgba(180,10,10,0.10)" : "rgba(200,20,20,0.04)",
    },
    safeArea: { flex: 1, paddingHorizontal: 22 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 8,
      paddingBottom: 12,
    },
    headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: c.success + "10",
      borderWidth: 0.5,
      borderColor: c.success + "28",
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    statusDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: c.success,
    },
    statusText: {
      color: c.success,
      fontSize: 10,
      fontWeight: "500",
      letterSpacing: 0.3,
    },
    heroBlock: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: 8,
    },
    eyebrow: {
      color: c.textSubtle,
      fontSize: 9,
      fontWeight: "600",
      letterSpacing: 3,
      textTransform: "uppercase",
      marginBottom: 10,
      textAlign: "center",
    },
    heroTitle: {
      fontSize: 36,
      fontWeight: "800",
      lineHeight: 40,
      textAlign: "center",
      letterSpacing: -1.5,
      marginBottom: 12,
    },
    heroTitleBase: { color: c.white },
    heroTitleRed: { color: c.red },
    heroSubtitle: {
      color: c.textMuted,
      fontSize: 12.5,
      textAlign: "center",
      lineHeight: 20,
      maxWidth: 230,
    },
    heroSubtitleAccent: { color: c.red },
    actionsBlock: { gap: 10, marginBottom: 12 },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      paddingVertical: 4,
      marginBottom: 8,
    },
    footerText: { color: c.textMuted, fontSize: 13 },
    footerLink: { color: c.red, fontSize: 13, fontWeight: "500" },
    slogan: { alignItems: "center", paddingBottom: 8 },
    sloganText: {
      color: c.textSubtle,
      fontSize: 10,
      letterSpacing: 1,
      fontStyle: "italic",
    },
  }));

  return { styles, isDark };
}
