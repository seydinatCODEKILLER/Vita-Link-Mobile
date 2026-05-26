import React, { useEffect, useRef } from "react";
import { View, Platform } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/src/store/auth.store";
import { useLocation } from "@/src/hooks/useLocation";
import { useNotifications } from "@/src/hooks/useNotifications";
import { InAppAlert } from "@/src/components/ui/InAppAlert";
import logger from "@/src/utils/logger.utils";
import { useSocket } from "@/src/hooks/useSocket";
import { useAlertStore } from "@/src/store/alerts.store";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";

const TABS = [
  {
    name: "index",
    label: "Alertes",
    icon: "heart" as const,
    iconOutline: "heart-outline" as const,
  },
  {
    name: "donation-days/index", // ✅ Nouvel onglet
    label: "Collectes",
    icon: "calendar" as const,
    iconOutline: "calendar-outline" as const,
  },
  {
    name: "jambaar/index",
    label: "Jambaar",
    icon: "trophy" as const,
    iconOutline: "trophy-outline" as const,
  },
  {
    name: "donations",
    label: "Mes dons",
    icon: "water" as const,
    iconOutline: "water-outline" as const,
  },
  {
    name: "profile/index",
    label: "Profil",
    icon: "person" as const,
    iconOutline: "person-outline" as const,
  },
] as const;

export default function DonorLayout() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/(auth)/welcome");
      return;
    }
    if (user.role !== "DONOR") router.replace("/(health)");
  }, [isAuthenticated, user]);

  const { requestAndSync: syncLocation } = useLocation();
  const { requestAndRegister, startForegroundListener } = useNotifications();
  useSocket();
  const inAppAlert = useAlertStore((s) => s.inAppAlert);
  const setInAppAlert = useAlertStore((s) => s.setInAppAlert);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!user || hasInitialized.current) return;
    hasInitialized.current = true;
    logger.info("Initialisation permissions donneur...");
    const init = async () => {
      syncLocation();
      await requestAndRegister();
      startForegroundListener();
      logger.info("Permissions initialisées");
    };
    init();
  }, [user?.id]);

  const safeBottom = Platform.select({
    ios: insets.bottom,
    android: insets.bottom > 0 ? insets.bottom : 20,
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

  if (!isAuthenticated || !user || user.role !== "DONOR") return null;

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

        {/* Routes cachées */}
        <Tabs.Screen name="alerts/[id]" options={{ href: null }} />
        <Tabs.Screen name="qrcode" options={{ href: null }} />
        <Tabs.Screen name="jambaar/badges" options={{ href: null }} />
        <Tabs.Screen name="jambaar/leaderboard" options={{ href: null }} />
        <Tabs.Screen name="jambaar/rewards" options={{ href: null }} />
        <Tabs.Screen name="profile/edit" options={{ href: null }} />
        <Tabs.Screen name="profile/settings" options={{ href: null }} />
        <Tabs.Screen name="donation-days/[id]" options={{ href: null }} />
      </Tabs>
    </View>
  );
}
