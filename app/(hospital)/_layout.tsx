import React, { useEffect, useRef } from "react";
import { View, Platform } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/src/store/auth.store";
import { useNotifications } from "@/src/hooks/useNotifications";
import { InAppAlert } from "@/src/components/ui/InAppAlert";
import logger from "@/src/utils/logger.utils";
import { useSocket } from "@/src/hooks/useSocket";
import { useAlertStore } from "@/src/store/alerts.store";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";

// ─── Onglets Hôpital / Centre de santé ────────────────────────
const TABS = [
  {
    name: "index",
    label: "Dashboard",
    icon: "grid" as const,
    iconOutline: "grid-outline" as const,
  },
  {
    name: "alerts/index",
    label: "Alertes",
    icon: "megaphone" as const,
    iconOutline: "megaphone-outline" as const,
  },
  {
    name: "blood-request/index",
    label: "Demandes",
    icon: "water" as const,
    iconOutline: "water-outline" as const,
  },
  {
    name: "profile",
    label: "Profil",
    icon: "business" as const,
    iconOutline: "business-outline" as const,
  },
] as const;

export default function HospitalLayout() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  // ── Sécurité & Redirection ──
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/(auth)/welcome");
      return;
    }

    // ✅ Redirection basée sur les rôles Agents
    if (user.role === "HOSPITAL_AGENT") {
      // L'hôpital reste sur son propre layout
      return;
    } else if (user.role === "CNTS_ADMIN" || user.role === "CNTS_AGENT") {
      // La CNTS est redirigée vers le layout Health
      router.replace("/(health)");
    } else {
      // Les donneurs ou les admins n'ont rien à faire ici
      router.replace("/unauthorized");
    }
  }, [isAuthenticated, user]);

  // ── Hooks (Notifications, Socket) ──
  const { requestAndRegister, startForegroundListener } = useNotifications();
  useSocket(); // Utile pour recevoir les mises à jour de stock en temps réel
  const inAppAlert = useAlertStore((s) => s.inAppAlert);
  const setInAppAlert = useAlertStore((s) => s.setInAppAlert);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!user || hasInitialized.current) return;
    hasInitialized.current = true;
    logger.info("Initialisation permissions agent hôpital...");
    const init = async () => {
      await requestAndRegister();
      startForegroundListener();
      logger.info("Permissions initialisées");
    };
    init();
  }, [user?.id]);

  // ── Styles ──
  const safeBottom = Platform.select({
    ios: insets.bottom,
    android: insets.bottom > 0 ? insets.bottom + 8 : 28,
    default: 8,
  });
  const tabBarHeight = 64 + safeBottom;

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    tabBar: {
      backgroundColor: "transparent",
      borderTopWidth: 1,
      borderTopColor: c.cardBorder,
      paddingTop: 8,
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      elevation: 0,
    },
    tabBarBg: { position: "absolute", inset: 0, backgroundColor: c.cardBg },
    tabLabel: {
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 0.3,
      marginTop: 2,
    },
    tabItem: { paddingTop: 4 },
    alertOverlay: {
      position: "absolute",
      top: Platform.OS === "ios" ? 56 : 44,
      left: 0,
      right: 0,
      zIndex: 9999,
      pointerEvents: "box-none",
    },
  }));

  // ── Guard ──
  if (!isAuthenticated || !user || user.role !== "HOSPITAL_AGENT") return null;

  return (
    <View style={styles.container}>
      {inAppAlert && (
        <View style={styles.alertOverlay} pointerEvents="box-none">
          <InAppAlert
            notification={inAppAlert}
            onDismiss={() => setInAppAlert(null)}
          />
        </View>
      )}

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: [
            styles.tabBar,
            { height: tabBarHeight, paddingBottom: safeBottom },
          ],
          tabBarActiveTintColor: colors.red,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: styles.tabItem,
          tabBarBackground: () => <View style={styles.tabBarBg} />,
        }}
      >
        {TABS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.label,
              tabBarIcon: ({ focused, color }) => (
                <Ionicons
                  name={focused ? tab.icon : tab.iconOutline}
                  size={22}
                  color={color}
                />
              ),
            }}
          />
        ))}

        {/* ── Routes cachées (accessibles via navigation programmatique) ── */}
        <Tabs.Screen name="alerts/create" options={{ href: null }} />
        <Tabs.Screen name="alerts/[id]" options={{ href: null }} />
        <Tabs.Screen name="blood-request/create" options={{ href: null }} />
        <Tabs.Screen name="blood-request/purchase-order" options={{ href: null }} />
        <Tabs.Screen name="blood-request/[id]" options={{ href: null }} />
        <Tabs.Screen name="staff/index" options={{ href: null }} />
        <Tabs.Screen name="staff/add" options={{ href: null }} />
      </Tabs>
    </View>
  );
}
