import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSmartBack } from "@/src/hooks/useSmartBack";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";
import { useAuthStore } from "@/src/store/auth.store";
import { useLocation } from "@/src/hooks/useLocation";
import { usersApi } from "@/src/api/users.api";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { AppColors } from "@/src/theme/colors";

// ─── Row component ─────────────────────────────────────────────
function SettingRow({
  icon,
  label,
  hint,
  color,
  right,
  onPress,
  last,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint?: string;
  color?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  last?: boolean;
  colors: AppColors;
}) {
  const rowColor = color ?? colors.textMuted;

  return (
    <TouchableOpacity
      style={[
        rowStyles(colors).row,
        !last && { borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      disabled={!onPress}
    >
      <View
        style={[
          rowStyles(colors).rowIcon,
          { backgroundColor: rowColor + "15" },
        ]}
      >
        <Ionicons name={icon} size={17} color={rowColor} />
      </View>
      <View style={rowStyles(colors).rowContent}>
        <Text style={[rowStyles(colors).rowLabel, color ? { color } : {}]}>
          {label}
        </Text>
        {hint && <Text style={rowStyles(colors).rowHint}>{hint}</Text>}
      </View>
      {right ??
        (onPress && (
          <Ionicons
            name="chevron-forward"
            size={14}
            color={colors.textSubtle}
          />
        ))}
    </TouchableOpacity>
  );
}

const rowStyles = (colors: AppColors) => ({
  row: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    padding: 14,
    minHeight: 50,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexShrink: 0 as const,
  },
  rowContent: { flex: 1, gap: 2 },
  rowLabel: { color: colors.white, fontSize: 14, fontWeight: "500" as const },
  rowHint: { color: colors.textMuted, fontSize: 11 },
});

// ─── Info Banner ───────────────────────────────────────────────
function InfoBanner({
  icon,
  text,
  color,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  color?: string;
  colors: AppColors;
}) {
  const bannerColor = color ?? colors.amber;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        padding: 12,
        marginHorizontal: 12,
        marginBottom: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: bannerColor + "25",
        backgroundColor: bannerColor + "08",
      }}
    >
      <Ionicons
        name={icon}
        size={15}
        color={bannerColor}
        style={{ marginTop: 1 }}
      />
      <Text
        style={{
          flex: 1,
          color: colors.textMuted,
          fontSize: 11,
          lineHeight: 16,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { requestAndSync: syncLocation } = useLocation();
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);

  const [pushEnabled, setPushEnabled] = useState(false);
  const [isCheckingPush, setIsCheckingPush] = useState(true);
  const [isSyncingLocation, setIsSyncingLocation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    haloTop: {
      position: "absolute",
      top: -80,
      right: -40,
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: c.redGlow,
      opacity: 0.5,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 24,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      color: c.white,
      fontSize: 22,
      fontWeight: "900",
      letterSpacing: -0.5,
    },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === "ios" ? 100 : 80,
    },
    sectionTitle: {
      color: c.textSubtle,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1.5,
      marginBottom: 10,
      marginTop: 8,
    },
    card: {
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.cardBorder,
      marginBottom: 8,
      overflow: "hidden",
    },
    pushRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 14,
      paddingRight: 6,
      minHeight: 50,
    },
    versionText: {
      color: c.textSubtle,
      fontSize: 13,
      fontWeight: "600",
    },
    deleteCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 14,
      minHeight: 50,
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.red + "40",
    },
    deleteArrow: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: c.red + "15",
      alignItems: "center",
      justifyContent: "center",
    },
    themeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 14,
      minHeight: 50,
    },
    themeIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.amber + "15",
    },
    themeLabel: {
      color: c.white,
      fontSize: 14,
      fontWeight: "500",
    },
    themeHint: {
      color: c.textMuted,
      fontSize: 11,
    },
  }));

  const goBack = useSmartBack({
    defaultRoute: "/(donor)/profile",
    routeMap: {
      profile: "/(donor)/profile",
    },
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        setPushEnabled(status === "granted");
      } catch {
      } finally {
        setIsCheckingPush(false);
      }
    })();
  }, []);

  const handleTogglePush = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === "granted") {
        setPushEnabled(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert(
          "Notifications bloquées",
          "Pour recevoir les alertes de don urgentes, activez les notifications dans les paramètres de votre téléphone.",
          [
            { text: "Annuler", style: "cancel" },
            {
              text: "Ouvrir les paramètres",
              onPress: () => Linking.openSettings(),
            },
          ],
        );
      }
    } else {
      Alert.alert(
        "Désactiver les notifications",
        "Vous ne recevrez plus d'alertes urgentes. Vous pouvez les réactiver à tout moment.",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Désactiver",
            style: "destructive",
            onPress: () => Linking.openSettings(),
          },
        ],
      );
    }
  };

  const handleSyncLocation = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSyncingLocation(true);
    try {
      await syncLocation();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Position mise à jour",
        "Votre localisation a été actualisée avec succès.",
      );
    } catch {
      Alert.alert("Erreur", "Impossible de récupérer votre position actuelle.");
    } finally {
      setIsSyncingLocation(false);
    }
  };

  const handleDeleteAccount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Supprimer mon compte",
      "Cette action est irréversible. Toutes vos données seront anonymisées et vos points Jambaar perdus.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Continuer", style: "destructive", onPress: confirmDeletion },
      ],
    );
  };

  const confirmDeletion = () => {
    Alert.alert(
      "Confirmation finale",
      "Êtes-vous absolument sûr de vouloir supprimer votre compte Vita-Link ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer définitivement",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await usersApi.deleteAccount();
              await logout("Compte supprimé");
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
              );
            } catch (error: any) {
              Alert.alert(
                "Erreur",
                error?.response?.data?.message ||
                  "Impossible de supprimer le compte.",
              );
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  // Couleur dynamique pour le push switch
  const pushColor = "#1D9E75";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.haloTop} />

      {/* ── Header ── */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.backBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={19} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        {/* ThemeToggle dans le header à la place du spacer vide */}
        <ThemeToggle size={40} />
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* ── Apparence ── */}
          <Text style={styles.sectionTitle}>APPARENCE</Text>
          <View style={styles.card}>
            <View style={styles.themeRow}>
              <View style={styles.themeIconWrap}>
                <Ionicons
                  name={theme === "dark" ? "moon-outline" : "sunny-outline"}
                  size={17}
                  color={colors.amber}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.themeLabel}>Thème de l&apos;interface</Text>
                <Text style={styles.themeHint}>
                  {theme === "dark" ? "Mode sombre" : "Mode clair"}
                </Text>
              </View>
              <ThemeToggle size={36} />
            </View>
          </View>

          {/* ── Notifications ── */}
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          <View style={styles.card}>
            <View style={styles.pushRow}>
              <View
                style={[
                  {
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  {
                    backgroundColor: pushEnabled
                      ? pushColor + "15"
                      : colors.cardBorder,
                  },
                ]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={17}
                  color={pushEnabled ? pushColor : colors.textMuted}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text
                  style={{
                    color: colors.white,
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  Notifications push
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                  {pushEnabled ? "Activées" : "Désactivées"}
                </Text>
              </View>
              {isCheckingPush ? (
                <ActivityIndicator size="small" color={colors.textMuted} />
              ) : (
                <Switch
                  trackColor={{ false: colors.cardBorder, true: pushColor }}
                  thumbColor={colors.cardBg}
                  value={pushEnabled}
                  onValueChange={handleTogglePush}
                  ios_backgroundColor={colors.cardBorder}
                />
              )}
            </View>
            <InfoBanner
              icon="information-circle-outline"
              text="Les notifications vous alertent en temps réel lorsqu'un hôpital proche a besoin de votre groupe sanguin."
              colors={colors}
            />
          </View>

          {/* ── Localisation ── */}
          <Text style={styles.sectionTitle}>LOCALISATION</Text>
          <View style={styles.card}>
            <SettingRow
              icon="locate-outline"
              label="Mettre à jour ma position"
              hint={
                user?.latitude
                  ? "Position actuelle disponible"
                  : "Nécessaire pour les alertes"
              }
              color={colors.amber}
              onPress={handleSyncLocation}
              right={
                isSyncingLocation ? (
                  <ActivityIndicator size="small" color={colors.amber} />
                ) : undefined
              }
              last
              colors={colors}
            />
            <InfoBanner
              icon="shield-checkmark-outline"
              text="Votre position n'est utilisée que pour vous envoyer des alertes de don proches. Elle n'est jamais partagée."
              color={colors.success}
              colors={colors}
            />
          </View>

          {/* ── À propos ── */}
          <Text style={styles.sectionTitle}>À PROPOS</Text>
          <View style={styles.card}>
            <SettingRow
              icon="document-text-outline"
              label="Conditions d'utilisation"
              colors={colors}
            />
            <SettingRow
              icon="shield-outline"
              label="Politique de confidentialité"
              colors={colors}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 14,
                minHeight: 50,
              }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.cardBorder,
                }}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={17}
                  color={colors.textMuted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.white,
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  Version
                </Text>
              </View>
              <Text style={styles.versionText}>1.0.0</Text>
            </View>
          </View>

          {/* ── Zone dangereuse ── */}
          <Text style={[styles.sectionTitle, { color: colors.red }]}>
            ZONE DANGEREUSE
          </Text>
          <TouchableOpacity
            style={styles.deleteCard}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
            disabled={isDeleting}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.red + "15",
              }}
            >
              <Ionicons name="trash-outline" size={17} color={colors.red} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={{ color: colors.red, fontSize: 14, fontWeight: "500" }}
              >
                Supprimer mon compte
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                Anonymisation définitive de vos données
              </Text>
            </View>
            {isDeleting ? (
              <ActivityIndicator size="small" color={colors.red} />
            ) : (
              <View style={styles.deleteArrow}>
                <Ionicons name="chevron-forward" size={14} color={colors.red} />
              </View>
            )}
          </TouchableOpacity>

          <View style={{ height: Platform.OS === "ios" ? 120 : 100 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
