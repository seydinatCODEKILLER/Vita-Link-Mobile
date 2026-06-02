import { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useCheckPendingRegistration } from "@/src/hooks/usePendingRegistration";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { AppColors } from "@/src/theme/colors";

// ─── Composant Logo ────────────────────────────────────────────
function VitaLinkLogo({ colors }: { colors: AppColors }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View
        style={{
          width: 36,
          height: 36,
          backgroundColor: colors.red,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="heart" size={18} color="#FFFFFF" />
      </View>
      <Text
        style={{
          color: colors.white,
          fontSize: 22,
          fontWeight: "700",
          letterSpacing: -0.5,
        }}
      >
        Vita<Text style={{ color: colors.red }}>Link</Text>
      </Text>
    </View>
  );
}

// ─── Composant Bouton d'action ─────────────────────────────────
interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel: string;
  onPress: () => void;
  variant: "primary" | "secondary";
  colors: AppColors;
}

function ActionButton({
  icon,
  label,
  sublabel,
  onPress,
  variant,
  colors,
}: ActionButtonProps) {
  const isPrimary = variant === "primary";
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          borderRadius: 16,
          padding: 16,
        },
        isPrimary
          ? { backgroundColor: colors.red }
          : {
              backgroundColor: colors.cardBg,
              borderWidth: 1,
              borderColor: colors.cardBorder,
            },
      ]}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isPrimary
            ? "rgba(255,255,255,0.18)"
            : colors.cardBorder,
        }}
      >
        <Ionicons name={icon} size={20} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: colors.white, fontSize: 15, fontWeight: "700" }}>
          {label}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
          {sublabel}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={isPrimary ? "#FFFFFF" : colors.textMuted}
      />
    </TouchableOpacity>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function WelcomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);

  useCheckPendingRegistration();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    safeArea: { flex: 1, paddingHorizontal: 24 },
    bgHaloTop: {
      position: "absolute",
      top: -80,
      left: -80,
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor: c.redGlow,
    },
    bgHaloBottom: {
      position: "absolute",
      bottom: 100,
      right: -60,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: c.haloLight,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 8,
      paddingBottom: 24,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "rgba(34,197,94,0.12)",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "rgba(34,197,94,0.25)",
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.success,
    },
    statusText: { color: c.success, fontSize: 11, fontWeight: "600" },
    heroBlock: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: 16,
    },
    heroIllustration: {
      width: 160,
      height: 160,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 32,
    },
    heroGradient: {
      position: "absolute",
      width: 160,
      height: 160,
      borderRadius: 80,
    },
    heroIconOuter: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "rgba(220,30,30,0.12)",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(220,30,30,0.25)",
    },
    heroIconInner: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: "rgba(220,30,30,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    pulse: {
      position: "absolute",
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "rgba(220,30,30,0.15)",
    },
    pulse1: { width: 130, height: 130 },
    pulse2: { width: 160, height: 160, borderColor: "rgba(220,30,30,0.07)" },
    heroTextBlock: { alignItems: "center", gap: 12 },
    heroEyebrow: {
      color: c.textMuted,
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 2.5,
    },
    heroTitle: {
      color: c.white,
      fontSize: 36,
      fontWeight: "800",
      textAlign: "center",
      lineHeight: 44,
      letterSpacing: -1,
    },
    heroSubtitle: {
      color: c.textMuted,
      fontSize: 14,
      textAlign: "center",
      lineHeight: 22,
      maxWidth: 280,
    },
    actionsBlock: { gap: 12, marginBottom: 20 },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    footerText: { color: c.textMuted, fontSize: 14 },
    footerLink: { color: c.red, fontSize: 14, fontWeight: "700" },
    slogan: { paddingBottom: 8, alignItems: "center" },
    sloganText: {
      color: c.textSubtle,
      fontSize: 11,
      letterSpacing: 0.5,
      fontStyle: "italic",
    },
  }));

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(btnAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    const pulseAnimation = Animated.loop(
      Animated.stagger(400, [
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      <View style={styles.bgHaloTop} />
      <View style={styles.bgHaloBottom} />

      <SafeAreaView style={styles.safeArea}>
        {/* ── Header ── */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <VitaLinkLogo colors={colors} />

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {/* Badge statut */}
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Opérationnel</Text>
            </View>
            {/* Toggle thème */}
            <ThemeToggle size={36} />
          </View>
        </Animated.View>

        {/* ── Bloc héro ── */}
        <Animated.View
          style={[
            styles.heroBlock,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.heroIllustration}>
            <LinearGradient
              colors={[colors.redGlow, "transparent"]}
              style={styles.heroGradient}
            />
            <View style={styles.heroIconOuter}>
              <View style={styles.heroIconInner}>
                <Ionicons name="heart" size={40} color={colors.red} />
              </View>
            </View>
            <Animated.View
              style={[
                styles.pulse,
                styles.pulse1,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <Animated.View
              style={[
                styles.pulse,
                styles.pulse2,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
          </View>

          <View style={styles.heroTextBlock}>
            <Text style={styles.heroEyebrow}>
              PLATEFORME D&apos;URGENCE MÉDICALE
            </Text>
            <Text style={styles.heroTitle}>
              Le lien qui{"\n"}
              <Text style={{ color: colors.red }}>sauve des vies</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Mise en relation instantanée entre donneurs de sang et structures
              de santé au Sénégal.
            </Text>
          </View>
        </Animated.View>

        {/* ── Boutons d'action ── */}
        <Animated.View style={[styles.actionsBlock, { opacity: btnAnim }]}>
          <ActionButton
            icon="person"
            label="Je suis donneur"
            sublabel="Inscription gratuite • 2 minutes"
            onPress={() => router.push("/register-donor")}
            variant="primary"
            colors={colors}
          />
          {/* 🆕 Séparation CNTS / Hôpital */}
          <ActionButton
            icon="business" // ou "medkit-outline"
            label="Je suis un hôpital"
            sublabel="Inscription structure de soin"
            onPress={() => router.push("/register-hospital")}
            variant="secondary"
            colors={colors}
          />
          <ActionButton
            icon="water-outline" // ou "flask-outline"
            label="Je suis la CNTS"
            sublabel="Centre National de Transfusion"
            onPress={() => router.push("/register-cnts")}
            variant="secondary"
            colors={colors}
          />
        </Animated.View>

        {/* ── Footer ── */}
        <Animated.View style={[styles.footer, { opacity: btnAnim }]}>
          <Text style={styles.footerText}>Déjà membre ? </Text>
          <TouchableOpacity
            onPress={() => router.push("/login")}
            activeOpacity={0.7}
          >
            <Text style={styles.footerLink}>Se connecter</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Slogan ── */}
        <Animated.View style={[styles.slogan, { opacity: btnAnim }]}>
          <Text style={styles.sloganText}>
            Le lien qui sauve, l&apos;honneur qui engage.
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
