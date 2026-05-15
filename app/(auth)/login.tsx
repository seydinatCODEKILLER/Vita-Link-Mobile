import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/src/components/ui/FormInput";
import { useLogin } from "@/src/hooks/useAuth";
import { loginSchema, type LoginValues } from "@/src/validators/auth.schema";
import { useAuthStore } from "@/src/store/auth.store";

// ─── Palette ──────────────────────────────────────────────────
const COLORS = {
  bg: "#080808",
  red: "#DC1E1E",
  redGlow: "rgba(220,30,30,0.13)",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.40)",
  textSubtle: "rgba(255,255,255,0.18)",
  cardBg: "rgba(255,255,255,0.05)",
  cardBorder: "rgba(255,255,255,0.09)",
} as const;

export default function LoginScreen() {
  const router = useRouter();
  const { mutateAsync: login, isPending } = useLogin();
  const user = useAuthStore((s) => s.user);

  // ── Redirect si déjà connecté ──
  useEffect(() => {
    if (user) {
      router.replace(
        user.role === "HEALTH_STRUCTURE" ? "/(health)" : "/(donor)",
      );
    }
  }, [user]);

  // ── Animations d'entrée ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── Form ──
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    Keyboard.dismiss();
    try {
      await login(values);
    } catch {
      // Toast géré dans useLogin → onError
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Halos décoratifs */}
        <View style={styles.haloBottomLeft} />
        <View style={styles.haloTopRight} />

        <SafeAreaView style={styles.safeArea}>
          {/* ── Back ── */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={19} color={COLORS.white} />
          </TouchableOpacity>

          {/* ── Corps ── */}
          <Animated.View
            style={[
              styles.body,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header : logo + titre */}
            <View style={styles.headerBlock}>
              {/* Badge espace pro */}
              <View style={styles.proBadgeRow}>
                <View style={styles.proIconWrap}>
                  <Ionicons name="business" size={20} color={COLORS.white} />
                </View>
                <View style={styles.proBadgeText}>
                  <Text style={styles.proEyebrow}>ESPACE PROFESSIONNEL</Text>
                  <Text style={styles.proTitle}>
                    Vita<Text style={{ color: COLORS.red }}>Link</Text>
                  </Text>
                </View>
              </View>

              <View style={styles.titleBlock}>
                <Text style={styles.title}>Bon retour 👋</Text>
                <Text style={styles.subtitle}>
                  Connectez-vous à votre espace structure de santé
                </Text>
              </View>
            </View>

            {/* ── Formulaire ── */}
            <View style={styles.formBlock}>
              <Controller
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Adresse email"
                    icon="mail-outline"
                    placeholder="directeur@hopital.sn"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    returnKeyType="next"
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Mot de passe"
                    icon="lock-closed-outline"
                    placeholder="••••••••"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                    isPassword
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                )}
              />

              {/* Mot de passe oublié */}
              <TouchableOpacity
                style={styles.forgotRow}
                activeOpacity={0.7}
                onPress={() => {
                  // TODO: implémenter la réinitialisation
                }}
              >
                <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </View>

            {/* ── CTA ── */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              activeOpacity={0.85}
              style={[styles.ctaBtn, isPending && styles.ctaBtnDisabled]}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Text style={styles.ctaBtnText}>Se connecter</Text>
                  <View style={styles.ctaBtnIcon}>
                    <Ionicons
                      name="arrow-forward"
                      size={17}
                      color={COLORS.white}
                    />
                  </View>
                </>
              )}
            </TouchableOpacity>

            {/* ── Divider ── */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* ── Lien donneur ── */}
            <View style={styles.donorRow}>
              <Text style={styles.donorText}>Vous êtes donneur ? </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/register-donor")}
                activeOpacity={0.7}
              >
                <Text style={styles.donorLink}>
                  S&apos;inscrire gratuitement
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* ── Info sécurité ── */}
          <View style={styles.securityRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={13}
              color={COLORS.textSubtle}
            />
            <Text style={styles.securityText}>
              Connexion sécurisée · Données chiffrées
            </Text>
          </View>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  safeArea: { flex: 1, paddingHorizontal: 24 },

  // ── Halos ──
  haloBottomLeft: {
    position: "absolute",
    bottom: -60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.redGlow,
  },
  haloTopRight: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(220,30,30,0.07)",
  },

  // ── Back ──
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 32,
  },

  // ── Body ──
  body: { flex: 1 },

  // ── Header ──
  headerBlock: {
    marginBottom: 32,
    gap: 20,
  },
  proBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  proIconWrap: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.red,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  proBadgeText: {
    gap: 2,
  },
  proEyebrow: {
    color: COLORS.textSubtle,
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 2,
  },
  proTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  titleBlock: {
    gap: 6,
  },
  title: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },

  // ── Formulaire ──
  formBlock: {
    marginBottom: 8,
  },
  forgotRow: {
    alignSelf: "flex-end",
    paddingVertical: 4,
    marginTop: -4,
    marginBottom: 8,
  },
  forgotText: {
    color: COLORS.red,
    fontSize: 13,
    fontWeight: "600",
  },

  // ── CTA ──
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.red,
    borderRadius: 16,
    paddingVertical: 17,
    marginBottom: 24,
  },
  ctaBtnDisabled: { opacity: 0.5 },
  ctaBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  ctaBtnIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Divider ──
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cardBorder,
  },
  dividerText: {
    color: COLORS.textSubtle,
    fontSize: 12,
  },

  // ── Lien donneur ──
  donorRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  donorText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  donorLink: {
    color: COLORS.red,
    fontSize: 14,
    fontWeight: "700",
  },

  // ── Sécurité ──
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingBottom: 10,
  },
  securityText: {
    color: COLORS.textSubtle,
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
