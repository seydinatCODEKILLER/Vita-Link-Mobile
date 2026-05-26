import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Platform,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  Animated,
  Dimensions,
  StyleSheet,
  Pressable,
} from "react-native";
import { Tabs, useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/src/store/auth.store";
import { useNotifications } from "@/src/hooks/useNotifications";
import { useLocation } from "@/src/hooks/useLocation";
import { InAppAlert } from "@/src/components/ui/InAppAlert";
import logger from "@/src/utils/logger.utils";
import { useSocket } from "@/src/hooks/useSocket";
import { useAlertStore } from "@/src/store/alerts.store";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

// ─── Onglets principaux (tab bar) ────────────────────────────────────────────
const PRIMARY_TABS = [
  {
    name: "index",
    label: "Dashboard",
    icon: "grid" as const,
    iconOutline: "grid-outline" as const,
  },
  {
    name: "alerts/index",
    label: "Alertes",
    icon: "medkit" as const,
    iconOutline: "medkit-outline" as const,
  },
  {
    name: "scan",
    label: "Scanner",
    icon: "qr-code" as const,
    iconOutline: "qr-code-outline" as const,
  },
  {
    name: "stock",
    label: "Stock Sang",
    icon: "water" as const,
    iconOutline: "water-outline" as const,
  },
] as const;

// ─── Onglets secondaires (bottom sheet "Plus") ────────────────────────────────
const SECONDARY_TABS = [
  {
    name: "profile",
    label: "Ma Structure",
    icon: "business" as const,
    route: "/(health)/profile" as const,
    description: "Gérez votre établissement",
    color: "#FF6B6B",
    shortcut: "⌘S",
  },
  {
    name: "journees",
    label: "Journées de Don",
    icon: "calendar" as const,
    route: "/(health)/journees" as const,
    description: "Planifiez vos collectes",
    color: "#4ECDC4",
    shortcut: "⌘J",
  },
] as const;

// ─── Bottom Sheet "Plus" - Design Compact & Moderne ───────────────────────────
interface MoreSheetProps {
  visible: boolean;
  onClose: () => void;
  insetBottom: number;
}

function MoreSheet({ visible, onClose, insetBottom }: MoreSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const colors = useColors();
  const { height: screenHeight } = Dimensions.get("window");

  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const itemsAnim = useRef(
    SECONDARY_TABS.map(() => new Animated.Value(0)),
  ).current;

  const sheetStyles = useThemedStyles((c) => ({
    container: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 16,
      paddingHorizontal: 16,
      backgroundColor: c.cardBg,
      paddingBottom: insetBottom + 20,
      overflow: "hidden",
    },
    handleContainer: {
      alignItems: "center",
      marginBottom: 20,
    },
    handle: {
      width: 32,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.cardBorder + "60",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 20,
      paddingHorizontal: 4,
    },
    headerLeft: {
      flex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: c.white,
      letterSpacing: -0.3,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 13,
      color: c.textMuted,
      letterSpacing: 0.1,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.cardBorder + "30",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },
    menuList: {
      gap: 6,
      marginBottom: 16,
    },
    menuItem: {
      borderRadius: 12,
      overflow: "hidden",
    },
    menuItemInner: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 12,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    itemContent: {
      flex: 1,
      marginRight: 8,
    },
    itemLabel: {
      fontSize: 15,
      fontWeight: "600",
      letterSpacing: -0.2,
      marginBottom: 2,
    },
    itemDescription: {
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.1,
    },
    itemMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    shortcut: {
      fontSize: 11,
      fontWeight: "500",
      color: c.textMuted + "80",
      letterSpacing: 0.5,
    },
    arrowIcon: {
      opacity: 0.5,
    },
    separator: {
      height: 1,
      backgroundColor: c.cardBorder + "20",
      marginVertical: 4,
      marginHorizontal: 4,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      paddingTop: 8,
    },
    footerDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.red + "40",
    },
    footerText: {
      fontSize: 11,
      color: c.textMuted + "80",
      letterSpacing: 0.3,
    },
  }));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 28,
          stiffness: 300,
          mass: 0.8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 20,
          stiffness: 250,
        }),
      ]).start();

      SECONDARY_TABS.forEach((_, index) => {
        Animated.timing(itemsAnim[index], {
          toValue: 1,
          delay: 80 + index * 50,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      SECONDARY_TABS.forEach((_, index) => {
        itemsAnim[index].setValue(0);
      });
    }
  }, [visible]);

  const handleNav = (route: string) => {
    onClose();
    setTimeout(() => router.push(route as any), 200);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={{ flex: 1 }}>
          <BlurView
            intensity={15}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: "rgba(0,0,0,0.4)",
                opacity: fadeAnim,
              },
            ]}
          />
        </Animated.View>
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          sheetStyles.container,
          {
            transform: [
              { translateY: slideAnim },
              { scaleX: scaleAnim },
              { scaleY: scaleAnim },
            ],
          },
        ]}
      >
        {/* Subtle gradient background */}
        <LinearGradient
          colors={["rgba(255,255,255,0.02)", "transparent"]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Handle */}
        <View style={sheetStyles.handleContainer}>
          <View style={sheetStyles.handle} />
        </View>

        {/* Header */}
        <View style={sheetStyles.header}>
          <View style={sheetStyles.headerLeft}>
            <Text style={sheetStyles.title}>Menu</Text>
            <Text style={sheetStyles.subtitle}>Fonctionnalités avancées</Text>
          </View>
          <TouchableOpacity
            style={sheetStyles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={sheetStyles.menuList}>
          {SECONDARY_TABS.map((tab, index) => {
            const isActive = pathname.startsWith(`/(health)/${tab.name}`);

            return (
              <Animated.View
                key={tab.name}
                style={[
                  {
                    opacity: itemsAnim[index],
                    transform: [
                      {
                        translateX: itemsAnim[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Pressable
                  style={({ pressed }) => [
                    sheetStyles.menuItem,
                    {
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                  onPress={() => handleNav(tab.route)}
                >
                  {({ pressed }) => (
                    <View
                      style={[
                        sheetStyles.menuItemInner,
                        {
                          backgroundColor: pressed
                            ? tab.color + "10"
                            : isActive
                              ? tab.color + "08"
                              : "transparent",
                        },
                      ]}
                    >
                      {/* Icône compacte */}
                      <View
                        style={[
                          sheetStyles.iconContainer,
                          {
                            backgroundColor: isActive
                              ? tab.color + "15"
                              : colors.cardBorder + "15",
                          },
                        ]}
                      >
                        <Ionicons
                          name={tab.icon}
                          size={20}
                          color={isActive ? tab.color : colors.textMuted}
                        />
                      </View>

                      {/* Contenu texte */}
                      <View style={sheetStyles.itemContent}>
                        <Text
                          style={[
                            sheetStyles.itemLabel,
                            {
                              color: isActive ? colors.white : colors.white,
                            },
                          ]}
                        >
                          {tab.label}
                        </Text>
                        <Text
                          style={[
                            sheetStyles.itemDescription,
                            {
                              color: isActive
                                ? tab.color + "AA"
                                : colors.textMuted,
                            },
                          ]}
                        >
                          {tab.description}
                        </Text>
                      </View>

                      {/* Métadonnées à droite */}
                      <View style={sheetStyles.itemMeta}>
                        <Text style={sheetStyles.shortcut}>{tab.shortcut}</Text>
                        <Ionicons
                          name="chevron-forward"
                          size={14}
                          color={isActive ? tab.color : colors.textMuted}
                          style={sheetStyles.arrowIcon}
                        />
                      </View>
                    </View>
                  )}
                </Pressable>

                {/* Séparateur subtil */}
                {index < SECONDARY_TABS.length - 1 && (
                  <View style={sheetStyles.separator} />
                )}
              </Animated.View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={sheetStyles.footer}>
          <View style={sheetStyles.footerDot} />
          <Text style={sheetStyles.footerText}>BloodLink Health</Text>
          <View style={sheetStyles.footerDot} />
        </View>
      </Animated.View>
    </Modal>
  );
}

// ─── Layout principal ─────────────────────────────────────────────────────────
export default function HealthLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isSecondaryActive = SECONDARY_TABS.some((t) =>
    pathname.startsWith(`/(health)/${t.name}`),
  );

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
      shadowOffset: {
        width: 0,
        height: -2,
      },
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

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/(auth)/welcome");
      return;
    }
    if (user.role !== "HEALTH_STRUCTURE") {
      router.replace("/(donor)");
    }
  }, [isAuthenticated, user]);

  const { requestAndRegister, startForegroundListener } = useNotifications();
  const { requestAndSync: syncLocation } = useLocation();

  useSocket();
  const inAppAlert = useAlertStore((s) => s.inAppAlert);
  const setInAppAlert = useAlertStore((s) => s.setInAppAlert);

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!user || hasInitialized.current) return;
    hasInitialized.current = true;
    logger.info("Initialisation permissions structure de santé...");
    const init = async () => {
      syncLocation();
      await requestAndRegister();
      startForegroundListener();
      logger.info("Permissions structure initialisées");
    };
    init();
  }, [user?.id]);

  const safeBottom = Platform.select({
    ios: insets.bottom,
    android: insets.bottom > 0 ? insets.bottom : 16,
    default: 8,
  });
  const tabBarHeight = 68 + safeBottom;

  if (!isAuthenticated || !user || user.role !== "HEALTH_STRUCTURE")
    return null;

  const moreColor = isSecondaryActive ? colors.red : colors.textMuted;

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

      <MoreSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        insetBottom={safeBottom}
      />

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
        {PRIMARY_TABS.map((tab) => (
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

        <Tabs.Screen
          name="alerts/[id]/index"
          options={{
            title: "Plus",
            tabBarButton: () => (
              <TouchableOpacity
                style={styles.moreButton}
                onPress={() => setSheetOpen(true)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Menu Plus"
                accessibilityState={{ selected: isSecondaryActive }}
              >
                <View style={styles.moreIconWrapper}>
                  <View style={styles.moreDots}>
                    {[0, 1, 2].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.moreDot,
                          {
                            backgroundColor: moreColor,
                            opacity: isSecondaryActive ? 1 : 0.6,
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
                <Text
                  style={[styles.tabLabel, { color: moreColor }]}
                  numberOfLines={1}
                >
                  Plus
                </Text>
              </TouchableOpacity>
            ),
          }}
        />

        {SECONDARY_TABS.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{ href: null }}
          />
        ))}

        <Tabs.Screen name="alerts/create" options={{ href: null }} />
        <Tabs.Screen name="alerts/[id]/dashboard" options={{ href: null }} />
        <Tabs.Screen name="staff/index" options={{ href: null }} />
        <Tabs.Screen name="profile/edit" options={{ href: null }} />
        <Tabs.Screen name="staff/add" options={{ href: null }} />
        <Tabs.Screen name="journees/index" options={{ href: null }} />
        <Tabs.Screen name="journees/[id]/index" options={{ href: null }} />
        <Tabs.Screen name="journees/[id]/edit" options={{ href: null }} />
        <Tabs.Screen name="journees/create" options={{ href: null }} />
      </Tabs>
    </View>
  );
}
