import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Location from "expo-location";
import { FormInput } from "@/src/components/ui/FormInput";
import { FormSelect } from "@/src/components/ui/FormSelect";
import {
  cntsStep1Schema,
  cntsStep2Schema,
  type CntsStep1Values,
  type CntsStep2Values,
  type RegisterCntsFormValues,
  SENEGAL_REGIONS,
} from "@/src/validators/auth.schema";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";
import { AppColors } from "@/src/theme/colors";
import { useRegisterCnts } from "@/src/hooks/useAuth";

// ─── Steps ────────────────────────────────────────────────────
const STEPS = [
  {
    title: "Votre profil",
    subtitle: "Informations du directeur de la CNTS",
    icon: "person-outline" as const,
  },
  {
    title: "Votre CNTS",
    subtitle: "Informations du centre de transfusion",
    icon: "business-outline" as const,
  },
];

// ─── Password Strength ─────────────────────────────────────────
function PasswordStrength({
  password,
  colors,
}: {
  password: string;
  colors: AppColors;
}) {
  const styles = useThemedStyles((c) => ({
    strengthCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderRadius: 10,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 9,
      marginTop: -8,
      marginBottom: 8,
    },
    strengthText: { fontSize: 11, flex: 1, lineHeight: 18 },
  }));

  if (!password) return null;

  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    digit: /[0-9]/.test(password),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const isStrong = passed === 3;
  const isMedium = passed === 2;

  const bgColor = isStrong
    ? "rgba(34,197,94,0.08)"
    : isMedium
      ? "rgba(250,199,117,0.08)"
      : "rgba(239,68,68,0.08)";
  const borderColor = isStrong
    ? "rgba(34,197,94,0.20)"
    : isMedium
      ? "rgba(250,199,117,0.20)"
      : "rgba(239,68,68,0.20)";
  const textColor = isStrong
    ? "rgba(34,197,94,0.85)"
    : isMedium
      ? "rgba(250,199,117,0.85)"
      : "rgba(239,68,68,0.85)";
  const iconName = isStrong
    ? ("shield-checkmark-outline" as const)
    : isMedium
      ? ("shield-outline" as const)
      : ("alert-circle-outline" as const);

  const hints = [
    { check: checks.length, label: "8+ caractères" },
    { check: checks.upper, label: "Majuscule" },
    { check: checks.digit, label: "Chiffre" },
  ];

  return (
    <View
      style={[styles.strengthCard, { backgroundColor: bgColor, borderColor }]}
    >
      <Ionicons name={iconName} size={14} color={textColor} />
      <Text style={[styles.strengthText, { color: textColor }]}>
        {hints.map((h, i) => (
          <Text key={i}>
            {i > 0 && <Text style={{ opacity: 0.4 }}> · </Text>}
            <Text style={{ opacity: h.check ? 1 : 0.45 }}>
              {h.check ? "✓ " : "✗ "}
              {h.label}
            </Text>
          </Text>
        ))}
      </Text>
    </View>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function RegisterCntsScreen() {
  const router = useRouter();
  const { mutateAsync: registerCnts, isPending } = useRegisterCnts();
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);
  const insets = useSafeAreaInsets();

  const [currentStep, setCurrentStep] = useState(1);
  const [isGeolocating, setIsGeolocating] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    safeArea: { flex: 1 },
    haloTop: {
      position: "absolute",
      top: -80,
      right: -60,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: c.redGlow,
    },
    haloBottom: {
      position: "absolute",
      bottom: 60,
      left: -60,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: c.haloLight,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 20,
      gap: 12,
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
    headerCenter: { flex: 1, alignItems: "center", gap: 6 },
    progressRow: { flexDirection: "row", gap: 6, width: "100%" },
    progressSegment: { flex: 1, height: 3, borderRadius: 2 },
    progressActive: { backgroundColor: c.red },
    progressInactive: { backgroundColor: c.cardBorder },
    stepCounter: {
      color: c.textMuted,
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 0.5,
    },
    stepIconBadge: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: "rgba(220,30,30,0.10)",
      borderWidth: 1,
      borderColor: "rgba(220,30,30,0.22)",
      alignItems: "center",
      justifyContent: "center",
    },
    titleBlock: { paddingHorizontal: 24, marginBottom: 4, gap: 3 },
    eyebrow: {
      color: c.textSubtle,
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 2,
    },
    title: {
      color: c.white,
      fontSize: 26,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    subtitle: { color: c.textMuted, fontSize: 13, lineHeight: 20 },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: Math.max(24, insets.bottom + 40),
    },
    stepContent: { gap: 2 },
    // ── Geo ──
    geoWrapper: { marginBottom: 16 },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 8,
    },
    geoLabel: {
      color: c.white,
      fontSize: 13,
      fontWeight: "600",
      letterSpacing: 0.3,
      opacity: 0.75,
    },
    geoRequired: { color: c.red, fontSize: 12, fontWeight: "600" },
    geoBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 14,
      borderWidth: 1.5,
      paddingVertical: 13,
      paddingHorizontal: 14,
    },
    geoBtnDefault: {
      backgroundColor: "rgba(220,30,30,0.06)",
      borderColor: "rgba(220,30,30,0.25)",
    },
    geoBtnSuccess: {
      backgroundColor: "rgba(34,197,94,0.06)",
      borderColor: "rgba(34,197,94,0.25)",
    },
    geoBtnError: { borderColor: "#EF4444" },
    geoIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    geoBtnLabel: { color: c.white, fontSize: 14, fontWeight: "600" },
    geoBtnCoords: {
      color: "rgba(34,197,94,0.70)",
      fontSize: 11,
      marginTop: 2,
      fontFamily: "monospace",
    },
    geoBtnSub: { color: c.textMuted, fontSize: 11, marginTop: 2 },
    geoErrorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 6,
      marginLeft: 2,
    },
    geoErrorText: { color: "#EF4444", fontSize: 12, flex: 1 },
    // ── Info card ──
    infoCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      backgroundColor: "rgba(220,30,30,0.07)",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "rgba(220,30,30,0.18)",
      padding: 14,
      marginBottom: 16,
    },
    infoIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: "rgba(220,30,30,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    infoTitle: {
      color: c.red,
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 2,
    },
    infoText: {
      color: "rgba(220,30,30,0.70)",
      fontSize: 12,
      lineHeight: 18,
    },
    // ── Pending card ──
    pendingCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      backgroundColor: "rgba(250,199,117,0.07)",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "rgba(250,199,117,0.20)",
      padding: 14,
      marginTop: 4,
    },
    pendingIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: "rgba(250,199,117,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    pendingTitle: {
      color: c.amber,
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 2,
    },
    pendingText: {
      color: "rgba(250,199,117,0.65)",
      fontSize: 12,
      lineHeight: 18,
    },
    // ── Footer ──
    footer: { paddingHorizontal: 24, paddingBottom: 10, gap: 14 },
    ctaBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: c.red,
      borderRadius: 16,
      paddingVertical: 17,
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
    loginRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    loginText: { color: c.textMuted, fontSize: 14 },
    loginLink: { color: c.red, fontSize: 14, fontWeight: "700" },
  }));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const animateTransition = useCallback(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 110,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: -14,
          duration: 110,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // ── Forms ──
  const form1 = useForm<CntsStep1Values>({
    resolver: zodResolver(cntsStep1Schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const form2 = useForm<CntsStep2Values>({
    resolver: zodResolver(cntsStep2Schema),
    defaultValues: {
      structureName: "",
      registrationNumber: "",
      address: "",
      region: undefined,
      latitude: undefined,
      longitude: undefined,
      structurePhone: "",
      structureEmail: "",
    },
  });

  const watchedPassword = form1.watch("password");
  const watchedLatitude = form2.watch("latitude");
  const watchedLongitude = form2.watch("longitude");

  // ── Géolocalisation ──
  const handleGeolocate = useCallback(async () => {
    setIsGeolocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error(
          "Permission de localisation refusée. Activez-la dans les paramètres.",
        );
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      form2.setValue("latitude", loc.coords.latitude, { shouldValidate: true });
      form2.setValue("longitude", loc.coords.longitude, {
        shouldValidate: true,
      });
    } catch (err: any) {
      form2.setError("latitude", {
        message: err?.message ?? "Impossible de récupérer la position",
      });
    } finally {
      setIsGeolocating(false);
    }
  }, [form2]);

  // ── Navigation entre steps ──
  const handleNext = async () => {
    await form1.handleSubmit(
      () => {
        animateTransition();
        setCurrentStep(2);
      },
      () => {},
    )();
  };

  const handleSubmit = async () => {
    await form2.handleSubmit(
      async (step2Data) => {
        Keyboard.dismiss();
        const step1Data = form1.getValues();
        const finalData: RegisterCntsFormValues = {
          ...step1Data,
          ...step2Data,
        };
        try {
          await registerCnts(finalData);
        } catch {}
      },
      () => {},
    )();
  };

  // ── Step 1 : Profil directeur ──
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      {/* Info card spécifique CNTS */}
      <View style={styles.infoCard}>
        <View style={styles.infoIconWrap}>
          <Ionicons name="water-outline" size={18} color={colors.red} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.infoTitle}>Centre National de Transfusion</Text>
          <Text style={styles.infoText}>
            Vous enregistrez une CNTS, autorité centrale de gestion du sang. Le
            directeur recevra le rôle CNTS_ADMIN.
          </Text>
        </View>
      </View>

      <Controller
        control={form1.control}
        name="firstName"
        render={({ field, fieldState }) => (
          <FormInput
            label="Prénom du directeur"
            icon="person-outline"
            placeholder="Aminata"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
            autoCapitalize="words"
          />
        )}
      />
      <Controller
        control={form1.control}
        name="lastName"
        render={({ field, fieldState }) => (
          <FormInput
            label="Nom du directeur"
            icon="person-outline"
            placeholder="Diop"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
            autoCapitalize="words"
          />
        )}
      />
      <Controller
        control={form1.control}
        name="email"
        render={({ field, fieldState }) => (
          <FormInput
            label="Email professionnel"
            icon="mail-outline"
            placeholder="directeur@cnts.sn"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
      />
      <Controller
        control={form1.control}
        name="phone"
        render={({ field, fieldState }) => (
          <FormInput
            label="Téléphone"
            sublabel="(+221)"
            icon="call-outline"
            placeholder="77 123 45 67"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
            keyboardType="phone-pad"
          />
        )}
      />
      <Controller
        control={form1.control}
        name="password"
        render={({ field, fieldState }) => (
          <FormInput
            label="Mot de passe"
            icon="lock-closed-outline"
            placeholder="Min. 8 caractères"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
            isPassword
          />
        )}
      />
      <PasswordStrength password={watchedPassword} colors={colors} />
      <Controller
        control={form1.control}
        name="confirmPassword"
        render={({ field, fieldState }) => (
          <FormInput
            label="Confirmer le mot de passe"
            icon="lock-closed-outline"
            placeholder="Répétez le mot de passe"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
            isPassword
          />
        )}
      />
    </View>
  );

  // ── Step 2 : Infos CNTS ──
  const renderStep2 = () => {
    const hasLocation =
      watchedLatitude !== undefined && watchedLongitude !== undefined;
    const locationError = form2.formState.errors.latitude?.message;

    return (
      <View style={styles.stepContent}>
        <Controller
          control={form2.control}
          name="structureName"
          render={({ field, fieldState }) => (
            <FormInput
              label="Nom de la CNTS"
              icon="business-outline"
              placeholder="Centre National de Transfusion Sanguine de Dakar"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              autoCapitalize="words"
            />
          )}
        />
        <Controller
          control={form2.control}
          name="registrationNumber"
          render={({ field, fieldState }) => (
            <FormInput
              label="N° d'enregistrement officiel"
              icon="document-text-outline"
              placeholder="CNTS-DKR-001"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              autoCapitalize="characters"
            />
          )}
        />
        <Controller
          control={form2.control}
          name="region"
          render={({ field, fieldState }) => (
            <FormSelect
              label="Région"
              icon="map-outline"
              placeholder="Sélectionnez la région..."
              value={field.value}
              options={SENEGAL_REGIONS}
              onSelect={field.onChange}
              error={fieldState.error?.message}
              modalTitle="Sélectionner une région"
            />
          )}
        />
        <Controller
          control={form2.control}
          name="address"
          render={({ field, fieldState }) => (
            <FormInput
              label="Adresse complète"
              icon="location-outline"
              placeholder="Avenue Blaise Diagne, Dakar"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              autoCapitalize="sentences"
            />
          )}
        />

        {/* ── Géolocalisation ── */}
        <View style={styles.geoWrapper}>
          <View style={styles.labelRow}>
            <Text style={styles.geoLabel}>Position GPS de la CNTS</Text>
            <Text style={styles.geoRequired}>* requis</Text>
          </View>

          <TouchableOpacity
            onPress={handleGeolocate}
            disabled={isGeolocating}
            activeOpacity={0.8}
            style={[
              styles.geoBtn,
              hasLocation ? styles.geoBtnSuccess : styles.geoBtnDefault,
              !!locationError && styles.geoBtnError,
            ]}
          >
            {isGeolocating ? (
              <>
                <ActivityIndicator size="small" color={colors.white} />
                <Text style={styles.geoBtnLabel}>Localisation en cours...</Text>
              </>
            ) : (
              <>
                <View
                  style={[
                    styles.geoIconWrap,
                    {
                      backgroundColor: hasLocation
                        ? "rgba(34,197,94,0.20)"
                        : "rgba(220,30,30,0.20)",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      hasLocation
                        ? "checkmark-circle-outline"
                        : "locate-outline"
                    }
                    size={18}
                    color={hasLocation ? colors.success : colors.red}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.geoBtnLabel,
                      { color: hasLocation ? colors.success : colors.white },
                    ]}
                  >
                    {hasLocation ? "Position enregistrée" : "Localiser la CNTS"}
                  </Text>
                  {hasLocation ? (
                    <Text style={styles.geoBtnCoords}>
                      {watchedLatitude?.toFixed(5)},{" "}
                      {watchedLongitude?.toFixed(5)}
                    </Text>
                  ) : (
                    <Text style={styles.geoBtnSub}>
                      Nécessaire pour cibler les donneurs proches
                    </Text>
                  )}
                </View>
                {hasLocation && (
                  <Ionicons
                    name="refresh-outline"
                    size={16}
                    color="rgba(34,197,94,0.60)"
                  />
                )}
              </>
            )}
          </TouchableOpacity>

          {locationError && (
            <View style={styles.geoErrorRow}>
              <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
              <Text style={styles.geoErrorText}>{locationError}</Text>
            </View>
          )}
        </View>

        {/* ── Optionnels ── */}
        <Controller
          control={form2.control}
          name="structurePhone"
          render={({ field, fieldState }) => (
            <FormInput
              label="Tél. CNTS"
              sublabel="(opt.)"
              icon="call-outline"
              placeholder="+221 33..."
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              keyboardType="phone-pad"
            />
          )}
        />
        <Controller
          control={form2.control}
          name="structureEmail"
          render={({ field, fieldState }) => (
            <FormInput
              label="Email CNTS"
              sublabel="(opt.)"
              icon="mail-outline"
              placeholder="contact@cnts-dakar.sn"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />

        {/* ── Pending card ── */}
        <View style={styles.pendingCard}>
          <View style={styles.pendingIconWrap}>
            <Ionicons name="time-outline" size={18} color={colors.amber} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={styles.pendingTitle}>Vérification sous 24-48h</Text>
            <Text style={styles.pendingText}>
              Notre équipe validera votre CNTS avant d&apos;activer l&apos;accès
              au système de gestion du sang.
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const stepInfo = STEPS[currentStep - 1];

  return (
    <View style={styles.container}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <View style={styles.haloTop} />
      <View style={styles.haloBottom} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
          {/* ── Header ── */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <TouchableOpacity
              onPress={() =>
                currentStep > 1 ? setCurrentStep(1) : router.back()
              }
              style={styles.backBtn}
              activeOpacity={0.75}
            >
              <Ionicons name="arrow-back" size={19} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <View style={styles.progressRow}>
                {STEPS.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.progressSegment,
                      i < currentStep
                        ? styles.progressActive
                        : styles.progressInactive,
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.stepCounter}>
                {currentStep} / {STEPS.length}
              </Text>
            </View>
            <View style={styles.stepIconBadge}>
              <Ionicons name={stepInfo.icon} size={16} color={colors.red} />
            </View>
          </Animated.View>

          {/* ── Titre ── */}
          <Animated.View
            style={[
              styles.titleBlock,
              { opacity: opacityAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.eyebrow}>
              ÉTAPE {currentStep} / {STEPS.length}
            </Text>
            <Text style={styles.title}>{stepInfo.title}</Text>
            <Text style={styles.subtitle}>{stepInfo.subtitle}</Text>
          </Animated.View>

          {/* ── Contenu ── */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={{
                opacity: opacityAnim,
                transform: [{ translateY: slideAnim }],
                display: currentStep === 1 ? "flex" : "none",
              }}
            >
              {renderStep1()}
            </Animated.View>
            <Animated.View
              style={{
                opacity: opacityAnim,
                transform: [{ translateY: slideAnim }],
                display: currentStep === 2 ? "flex" : "none",
              }}
            >
              {renderStep2()}
            </Animated.View>

            {/* ── Footer ── */}
            <View style={[styles.footer, { marginTop: 16 }]}>
              <TouchableOpacity
                onPress={currentStep === 1 ? handleNext : handleSubmit}
                activeOpacity={0.85}
                style={[styles.ctaBtn, isPending && styles.ctaBtnDisabled]}
                disabled={isPending}
              >
                {isPending ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <>
                    <Text style={styles.ctaBtnText}>
                      {currentStep === 1 ? "Continuer" : "Soumettre la demande"}
                    </Text>
                    <View style={styles.ctaBtnIcon}>
                      <Ionicons
                        name={
                          currentStep === 1
                            ? "arrow-forward"
                            : "checkmark-outline"
                        }
                        size={17}
                        color={colors.white}
                      />
                    </View>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.loginRow}>
                <Text style={styles.loginText}>Déjà inscrit ? </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/login")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginLink}>Se connecter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}
