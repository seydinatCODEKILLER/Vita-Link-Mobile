import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
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
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";

export default function LoginScreen() {
  const router = useRouter();
  const { mutateAsync: login, isPending } = useLogin();
  const user = useAuthStore((s) => s.user);
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);

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

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    safeArea: { flex: 1, paddingHorizontal: 24 },
    haloBottomLeft: {
      position: "absolute",
      bottom: -60,
      left: -60,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: c.redGlow,
    },
    haloTopRight: {
      position: "absolute",
      top: -40,
      right: -40,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: c.haloLight,
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
      marginTop: 8,
      marginBottom: 32,
    },
    body: { flex: 1 },
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
      backgroundColor: c.red,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    proBadgeText: { gap: 2 },
    proEyebrow: {
      color: c.textSubtle,
      fontSize: 9,
      fontWeight: "600",
      letterSpacing: 2,
    },
    proTitle: {
      color: c.white,
      fontSize: 16,
      fontWeight: "700",
    },
    titleBlock: { gap: 6 },
    title: {
      color: c.white,
      fontSize: 28,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    subtitle: {
      color: c.textMuted,
      fontSize: 14,
      lineHeight: 21,
    },
    formBlock: { marginBottom: 8 },
    forgotRow: {
      alignSelf: "flex-end",
      paddingVertical: 4,
      marginTop: -4,
      marginBottom: 8,
    },
    forgotText: {
      color: c.red,
      fontSize: 13,
      fontWeight: "600",
    },
    ctaBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: c.red,
      borderRadius: 16,
      paddingVertical: 17,
      marginBottom: 24,
    },
    ctaBtnDisabled: { opacity: 0.5 },
    ctaBtnText: {
      color: c.white,
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
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: c.cardBorder,
    },
    dividerText: {
      color: c.textSubtle,
      fontSize: 12,
    },
    donorRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    donorText: {
      color: c.textMuted,
      fontSize: 14,
    },
    donorLink: {
      color: c.red,
      fontSize: 14,
      fontWeight: "700",
    },
    securityRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingBottom: 10,
    },
    securityText: {
      color: c.textSubtle,
      fontSize: 11,
      letterSpacing: 0.3,
    },
  }));

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar style={theme === "dark" ? "light" : "dark"} />

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
            <Ionicons name="arrow-back" size={19} color={colors.white} />
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
                  <Ionicons name="business" size={20} color={colors.white} />
                </View>
                <View style={styles.proBadgeText}>
                  <Text style={styles.proEyebrow}>ESPACE PROFESSIONNEL</Text>
                  <Text style={styles.proTitle}>
                    Vita<Text style={{ color: colors.red }}>Link</Text>
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
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <Text style={styles.ctaBtnText}>Se connecter</Text>
                  <View style={styles.ctaBtnIcon}>
                    <Ionicons
                      name="arrow-forward"
                      size={17}
                      color={colors.white}
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
                onPress={() => router.push("/(auth)/reconnect-donor")}
                activeOpacity={0.7}
              >
                <Text style={styles.donorLink}>Se reconnecter par code</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* ── Info sécurité ── */}
          <View style={styles.securityRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={13}
              color={colors.textSubtle}
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
