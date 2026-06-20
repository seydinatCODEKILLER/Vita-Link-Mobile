import React, { useEffect, useRef } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  Animated,
  Dimensions,
  StyleSheet,
  Pressable,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { SECONDARY_TABS } from "@/src/constants/healthTabs.config";

interface MoreSheetProps {
  visible: boolean;
  onClose: () => void;
  insetBottom: number;
}

export function MoreSheet({ visible, onClose, insetBottom }: MoreSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const colors = useColors();
  const { height: screenHeight } = Dimensions.get("window");

  // ── Animations ──────────────────────────────────────────────────────────────
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const itemsAnim = useRef(
    SECONDARY_TABS.map(() => new Animated.Value(0)),
  ).current;

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

  // ── Styles ──────────────────────────────────────────────────────────────────
  const s = useThemedStyles((c) => ({
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
    handleContainer: { alignItems: "center", marginBottom: 20 },
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
    headerLeft: { flex: 1 },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: c.white,
      letterSpacing: -0.3,
      marginBottom: 4,
    },
    subtitle: { fontSize: 13, color: c.textMuted, letterSpacing: 0.1 },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.cardBorder + "30",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },
    menuList: { gap: 6, marginBottom: 16 },
    menuItem: { borderRadius: 12, overflow: "hidden" },
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
    itemContent: { flex: 1, marginRight: 8 },
    itemLabel: {
      fontSize: 15,
      fontWeight: "600",
      letterSpacing: -0.2,
      marginBottom: 2,
    },
    itemDescription: { fontSize: 12, lineHeight: 16, letterSpacing: 0.1 },
    itemMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
    shortcut: {
      fontSize: 11,
      fontWeight: "500",
      color: c.textMuted + "80",
      letterSpacing: 0.5,
    },
    arrowIcon: { opacity: 0.5 },
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

  const handleNav = (route: string) => {
    onClose();
    setTimeout(() => router.push(route as any), 200);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
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
              { backgroundColor: "rgba(0,0,0,0.4)", opacity: fadeAnim },
            ]}
          />
        </Animated.View>
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          s.container,
          {
            transform: [
              { translateY: slideAnim },
              { scaleX: scaleAnim },
              { scaleY: scaleAnim },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={["rgba(255,255,255,0.02)", "transparent"]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Handle */}
        <View style={s.handleContainer}>
          <View style={s.handle} />
        </View>

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.title}>Menu</Text>
            <Text style={s.subtitle}>Fonctionnalités avancées</Text>
          </View>
          <TouchableOpacity
            style={s.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Liste des items */}
        <View style={s.menuList}>
          {SECONDARY_TABS.map((tab, index) => {
            const isActive = pathname.startsWith(`/(health)/${tab.name}`);

            return (
              <Animated.View
                key={tab.name}
                style={{
                  opacity: itemsAnim[index],
                  transform: [
                    {
                      translateX: itemsAnim[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-10, 0],
                      }),
                    },
                  ],
                }}
              >
                <Pressable
                  style={({ pressed }) => [
                    s.menuItem,
                    { transform: [{ scale: pressed ? 0.98 : 1 }] },
                  ]}
                  onPress={() => handleNav(tab.route)}
                >
                  {({ pressed }) => (
                    <View
                      style={[
                        s.menuItemInner,
                        {
                          backgroundColor: pressed
                            ? tab.color + "10"
                            : isActive
                              ? tab.color + "08"
                              : "transparent",
                        },
                      ]}
                    >
                      <View
                        style={[
                          s.iconContainer,
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

                      <View style={s.itemContent}>
                        <Text style={[s.itemLabel, { color: colors.white }]}>
                          {tab.label}
                        </Text>
                        <Text
                          style={[
                            s.itemDescription,
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

                      <View style={s.itemMeta}>
                        <Text style={s.shortcut}>{tab.shortcut}</Text>
                        <Ionicons
                          name="chevron-forward"
                          size={14}
                          color={isActive ? tab.color : colors.textMuted}
                          style={s.arrowIcon}
                        />
                      </View>
                    </View>
                  )}
                </Pressable>

                {index < SECONDARY_TABS.length - 1 && (
                  <View style={s.separator} />
                )}
              </Animated.View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <View style={s.footerDot} />
          <Text style={s.footerText}>Vita-Link CNTS</Text>
          <View style={s.footerDot} />
        </View>
      </Animated.View>
    </Modal>
  );
}
