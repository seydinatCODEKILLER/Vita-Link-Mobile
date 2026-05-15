import { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useCheckPendingRegistration } from "@/src/hooks/usePendingRegistration";

// ─── Palette Vita-Link ─────────────────────────────────────────
const COLORS = {
  bg: "#080808",
  bgCard: "rgba(255,255,255,0.05)",
  bgCardBorder: "rgba(255,255,255,0.10)",
  red: "#DC1E1E",
  redDark: "#A81515",
  redGlow: "rgba(220,30,30,0.20)",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.40)",
  textSubtle: "rgba(255,255,255,0.18)",
  iconBg: "rgba(255,255,255,0.10)",
} as const;

// ─── Composant Logo ────────────────────────────────────────────
function VitaLinkLogo() {
  return (
    <View style={styles.logoRow}>
      <View style={styles.logoIcon}>
        <Ionicons name="heart" size={18} color={COLORS.white} />
      </View>
      <Text style={styles.logoText}>
        Vita<Text style={{ color: COLORS.red }}>Link</Text>
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
}

function ActionButton({
  icon,
  label,
  sublabel,
  onPress,
  variant,
}: ActionButtonProps) {
  const isPrimary = variant === "primary";
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.actionBtn,
        isPrimary ? styles.actionBtnPrimary : styles.actionBtnSecondary,
      ]}
    >
      {/* Icône */}
      <View
        style={[
          styles.actionIcon,
          isPrimary ? styles.actionIconPrimary : styles.actionIconSecondary,
        ]}
      >
        <Ionicons name={icon} size={20} color={COLORS.white} />
      </View>

      {/* Textes */}
      <View style={styles.actionTextBlock}>
        <Text style={styles.actionLabel}>{label}</Text>
        <Text style={styles.actionSublabel}>{sublabel}</Text>
      </View>

      {/* Chevron */}
      <Ionicons
        name="chevron-forward"
        size={18}
        color={isPrimary ? COLORS.white : COLORS.textMuted}
      />
    </TouchableOpacity>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function WelcomeScreen() {
  const router = useRouter();

  // ✅ Une seule ligne pour gérer toute la logique de reprise !
  useCheckPendingRegistration();

  // Animations d'entrée
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Animations d'entrée (séquence unique)
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

    // 2. Animation de pulsation (boucle)
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
    return () => {
      pulseAnimation.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ── Fond avec halos ── */}
      <View style={styles.bgHaloTop} />
      <View style={styles.bgHaloBottom} />

      <SafeAreaView style={styles.safeArea}>
        {/* ── Header logo ── */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <VitaLinkLogo />

          {/* Badge statut */}
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Opérationnel</Text>
          </View>
        </Animated.View>

        {/* ── Bloc héro ── */}
        <Animated.View
          style={[
            styles.heroBlock,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Illustration centrale */}
          <View style={styles.heroIllustration}>
            <LinearGradient
              colors={[COLORS.redGlow, "transparent"]}
              style={styles.heroGradient}
            />
            <View style={styles.heroIconOuter}>
              <View style={styles.heroIconInner}>
                <Ionicons name="heart" size={40} color={COLORS.red} />
              </View>
            </View>

            {/* ✅ Pulsation décorative animée */}
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

          {/* Texte héro */}
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroEyebrow}>
              PLATEFORME D’URGENCE MÉDICALE
            </Text>
            <Text style={styles.heroTitle}>
              Le lien qui{"\n"}
              <Text style={{ color: COLORS.red }}>sauve des vies</Text>
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
          />

          <ActionButton
            icon="business"
            label="Je suis un hôpital"
            sublabel="Enregistrement de structure"
            onPress={() => router.push("/register-structure")}
            variant="secondary"
          />
        </Animated.View>

        {/* ── Footer : lien connexion ── */}
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
            Le lien qui sauve, l’honneur qui engage.
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // ── Fond ──
  bgHaloTop: {
    position: "absolute",
    top: -80,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.redGlow,
  },
  bgHaloBottom: {
    position: "absolute",
    bottom: 100,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(220,30,30,0.08)",
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 24,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.red,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
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
    backgroundColor: "#22C55E",
  },
  statusText: {
    color: "#22C55E",
    fontSize: 11,
    fontWeight: "600",
  },

  // ── Héro ──
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
    position: "relative",
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
  pulse1: {
    width: 130,
    height: 130,
  },
  pulse2: {
    width: 160,
    height: 160,
    borderColor: "rgba(220,30,30,0.07)",
  },
  heroTextBlock: {
    alignItems: "center",
    gap: 12,
  },
  heroEyebrow: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 44,
    letterSpacing: -1,
  },
  heroSubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },

  // ── Boutons ──
  actionsBlock: {
    gap: 12,
    marginBottom: 20,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    padding: 16,
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.red,
  },
  actionBtnSecondary: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.bgCardBorder,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconPrimary: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  actionIconSecondary: {
    backgroundColor: COLORS.iconBg,
  },
  actionTextBlock: {
    flex: 1,
    gap: 2,
  },
  actionLabel: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
  actionSublabel: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 12,
  },

  // ── Footer ──
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  footerLink: {
    color: COLORS.red,
    fontSize: 14,
    fontWeight: "700",
  },

  // ── Slogan ──
  slogan: {
    paddingBottom: 8,
    alignItems: "center",
  },
  sloganText: {
    color: COLORS.textSubtle,
    fontSize: 11,
    letterSpacing: 0.5,
    fontStyle: "italic",
  },
});
