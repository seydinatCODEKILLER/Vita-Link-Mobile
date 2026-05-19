import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";
import { useAuthStore } from "@/src/store/auth.store";
import { useLocation } from "@/src/hooks/useLocation";
import { usersApi } from "@/src/api/users.api";

// ─── Palette ──────────────────────────────────────────────────
const COLORS = {
  bg: "#080808",
  cardBg: "#111111",
  cardBorder: "rgba(255,255,255,0.08)",
  red: "#DC1E1E",
  redGlow: "rgba(220,30,30,0.12)",
  green: "#1D9E75",
  greenGlow: "rgba(29,158,117,0.12)",
  amber: "#FAC775",
  amberGlow: "rgba(250,199,117,0.10)",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.45)",
  textSubtle: "rgba(255,255,255,0.18)",
} as const;

// ─── Row component ─────────────────────────────────────────────
function SettingRow({
  icon,
  label,
  hint,
  color = COLORS.textMuted,
  right,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint?: string;
  color?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, !last && styles.rowBorder]}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      disabled={!onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={17} color={color} />
      </View>
      <View style={styles.rowContent}>
        <Text
          style={[styles.rowLabel, color !== COLORS.textMuted && { color }]}
        >
          {label}
        </Text>
        {hint && <Text style={styles.rowHint}>{hint}</Text>}
      </View>
      {right ??
        (onPress && (
          <Ionicons
            name="chevron-forward"
            size={14}
            color={COLORS.textSubtle}
          />
        ))}
    </TouchableOpacity>
  );
}

// ─── Info Banner ───────────────────────────────────────────────
function InfoBanner({
  icon,
  text,
  color = COLORS.amber,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  color?: string;
}) {
  return (
    <View
      style={[
        styles.infoBanner,
        { borderColor: color + "25", backgroundColor: color + "08" },
      ]}
    >
      <Ionicons name={icon} size={15} color={color} style={{ marginTop: 1 }} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { requestAndSync: syncLocation } = useLocation();

  const [pushEnabled, setPushEnabled] = useState(false);
  const [isCheckingPush, setIsCheckingPush] = useState(true);
  const [isSyncingLocation, setIsSyncingLocation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

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
    const checkPushStatus = async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        setPushEnabled(status === "granted");
      } catch {
        // Silencieux
      } finally {
        setIsCheckingPush(false);
      }
    };
    checkPushStatus();
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Halo décoratif */}
      <View style={styles.haloTop} />

      {/* ── Header ── */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={19} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {/* ── Notifications ── */}
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          <View style={styles.card}>
            <View style={[styles.row, { paddingRight: 6 }]}>
              <View
                style={[
                  styles.rowIcon,
                  {
                    backgroundColor: pushEnabled
                      ? COLORS.green + "15"
                      : "rgba(255,255,255,0.05)",
                  },
                ]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={17}
                  color={pushEnabled ? COLORS.green : COLORS.textMuted}
                />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Notifications push</Text>
                <Text style={styles.rowHint}>
                  {pushEnabled ? "Activées" : "Désactivées"}
                </Text>
              </View>
              {isCheckingPush ? (
                <ActivityIndicator size="small" color={COLORS.textMuted} />
              ) : (
                <Switch
                  trackColor={{
                    false: "rgba(255,255,255,0.10)",
                    true: COLORS.green,
                  }}
                  thumbColor={COLORS.white}
                  value={pushEnabled}
                  onValueChange={handleTogglePush}
                  ios_backgroundColor="rgba(255,255,255,0.10)"
                />
              )}
            </View>

            <InfoBanner
              icon="information-circle-outline"
              text="Les notifications vous alertent en temps réel lorsqu'un hôpital proche a besoin de votre groupe sanguin."
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
              color={COLORS.amber}
              onPress={handleSyncLocation}
              right={
                isSyncingLocation ? (
                  <ActivityIndicator size="small" color={COLORS.amber} />
                ) : undefined
              }
            />

            <InfoBanner
              icon="shield-checkmark-outline"
              text="Votre position n'est utilisée que pour vous envoyer des alertes de don proches. Elle n'est jamais partagée."
              color={COLORS.green}
            />
          </View>

          {/* ── À propos ── */}
          <Text style={styles.sectionTitle}>À PROPOS</Text>
          <View style={styles.card}>
            <SettingRow
              icon="document-text-outline"
              label="Conditions d'utilisation"
              last
            />
            <View style={styles.rowBorder} />
            <SettingRow
              icon="shield-outline"
              label="Politique de confidentialité"
              last
            />
            <View style={styles.rowBorder} />
            <View style={styles.row}>
              <View
                style={[
                  styles.rowIcon,
                  { backgroundColor: "rgba(255,255,255,0.05)" },
                ]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={17}
                  color={COLORS.textMuted}
                />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Version</Text>
              </View>
              <Text style={styles.versionText}>1.0.0</Text>
            </View>
          </View>

          {/* ── Zone dangereuse ── */}
          <Text style={[styles.sectionTitle, { color: COLORS.red }]}>
            ZONE DANGEREUSE
          </Text>
          <TouchableOpacity
            style={styles.deleteCard}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
            disabled={isDeleting}
          >
            <View
              style={[styles.rowIcon, { backgroundColor: COLORS.red + "15" }]}
            >
              <Ionicons name="trash-outline" size={17} color={COLORS.red} />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: COLORS.red }]}>
                Supprimer mon compte
              </Text>
              <Text style={styles.rowHint}>
                Anonymisation définitive de vos données
              </Text>
            </View>
            {isDeleting ? (
              <ActivityIndicator size="small" color={COLORS.red} />
            ) : (
              <View style={styles.deleteArrow}>
                <Ionicons name="chevron-forward" size={14} color={COLORS.red} />
              </View>
            )}
          </TouchableOpacity>

          {/* ✅ Espaceur pour rendre le bouton visible au-dessus de la tab bar */}
          <View style={{ height: Platform.OS === "ios" ? 120 : 100 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // Halo
  haloTop: {
    position: "absolute",
    top: -80,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.redGlow,
    opacity: 0.5,
  },

  // Header
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
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 100 : 80,
  },

  // Sections
  sectionTitle: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 8,
  },

  // Card
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 8,
    overflow: "hidden",
  },

  // Rows
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    minHeight: 50,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
  },
  rowHint: {
    color: COLORS.textMuted,
    fontSize: 11,
  },

  // Info Banner
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },

  // Version
  versionText: {
    color: COLORS.textSubtle,
    fontSize: 13,
    fontWeight: "600",
  },

  // Delete Card
  deleteCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    minHeight: 50,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(220,30,30,0.25)",
  },
  deleteArrow: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.red + "15",
    alignItems: "center",
    justifyContent: "center",
  },
});
