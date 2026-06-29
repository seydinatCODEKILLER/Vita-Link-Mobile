import { MoreSheet } from "@/src/components/navigation/MoreSheet";
import { InAppAlert } from "@/src/components/ui/InAppAlert";
import {
  PRIMARY_TABS,
  SECONDARY_TABS,
} from "@/src/constants/healthTabs.config";
import { useHealthLayout } from "@/src/hooks/useHealthLayout";
import { useTabStyles } from "@/src/styles/useTabStyles";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function HealthLayout() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  const {
    user,
    isAuthenticated,
    isCntsUser,
    inAppAlert,
    setInAppAlert,
    safeBottom,
    tabBarHeight,
  } = useHealthLayout();

  const { styles, colors } = useTabStyles(tabBarHeight, safeBottom);

  if (!isAuthenticated || !user || !isCntsUser) return null;

  const isSecondaryActive = SECONDARY_TABS.some((t) =>
    pathname.startsWith(`/(health)/${t.name}`),
  );
  const moreColor = isSecondaryActive ? colors.red : colors.textMuted;

  return (
    <View style={styles.container}>
      {/* ── Alerte in-app ─────────────────────────────────────────────────── */}
      {inAppAlert && (
        <View style={styles.alertOverlay} pointerEvents="box-none">
          <InAppAlert
            notification={inAppAlert}
            onDismiss={() => setInAppAlert(null)}
          />
        </View>
      )}

      {/* ── Bottom sheet "Plus" ───────────────────────────────────────────── */}
      <MoreSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        insetBottom={safeBottom}
      />

      {/* ── Tab navigator ─────────────────────────────────────────────────── */}
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
        {/* Onglets principaux */}
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

        {/* Bouton "Plus" */}
        <Tabs.Screen
          name="profile/edit"
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

        {/* Routes cachées */}
        <Tabs.Screen name="blood-requests/[id]" options={{ href: null }} />
        <Tabs.Screen name="alerts/index" options={{ href: null }} />
        <Tabs.Screen name="alerts/create" options={{ href: null }} />
        <Tabs.Screen name="alerts/[id]/index" options={{ href: null }} />
        <Tabs.Screen name="alerts/[id]/dashboard" options={{ href: null }} />
        <Tabs.Screen name="hospitals/index" options={{ href: null }} />
        <Tabs.Screen name="hospitals/[id]" options={{ href: null }} />
        <Tabs.Screen name="purchase-orders/index" options={{ href: null }} />
        <Tabs.Screen name="journees/index" options={{ href: null }} />
        <Tabs.Screen name="journees/create" options={{ href: null }} />
        <Tabs.Screen name="journees/[id]/index" options={{ href: null }} />
        <Tabs.Screen name="journees/[id]/edit" options={{ href: null }} />
        <Tabs.Screen name="staff/index" options={{ href: null }} />
        <Tabs.Screen name="staff/add" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
      </Tabs>
    </View>
  );
}
