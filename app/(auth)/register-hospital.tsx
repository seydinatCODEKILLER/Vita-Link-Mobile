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
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Location from "expo-location";
import { FormInput } from "@/src/components/ui/FormInput";
import { FormSelect } from "@/src/components/ui/FormSelect";
import CntsSelectSheet from "@/src/components/ui/CntsSelectSheet";
import {
  hospitalStep1Schema,
  hospitalStep2Schema,
  hospitalStep3Schema,
  type HospitalStep1Values,
  type HospitalStep2Values,
  type HospitalStep3Values,
  type RegisterHospitalFormValues,
  SENEGAL_REGIONS,
} from "@/src/validators/auth.schema";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";
import { AppColors } from "@/src/theme/colors";
import { useRegisterHospital } from "@/src/hooks/useAuth";
import { AvailableCnts } from "@/src/types/healthStructure.type";

// ─── Steps ────────────────────────────────────────────────────
const STEPS = [
  {
    title: "Votre profil",
    subtitle: "Informations du directeur de l'établissement",
    icon: "person-outline" as const,
  },
  {
    title: "Établissement",
    subtitle: "Hôpital ou Centre de santé",
    icon: "business-outline" as const,
  },
  {
    title: "Affiliation",
    subtitle: "Rattachement à la CNTS régionale",
    icon: "link-outline" as const,
  },
];

// ─── Password Strength (Identique à CNTS) ─────────────────────
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
export default function RegisterHospitalScreen() {
  const router = useRouter();
  const { mutateAsync: registerHospital, isPending } = useRegisterHospital();
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);

  const [currentStep, setCurrentStep] = useState(1);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [isCntsSheetVisible, setIsCntsSheetVisible] = useState(false);
  const [selectedCnts, setSelectedCnts] = useState<AvailableCnts | null>(null);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const styles = useThemedStyles((c) => ({
    // ... (Même styles que register-cnts.tsx : container, safeArea, haloTop, header, etc.)
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
    scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
    stepContent: { gap: 2 },
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
    infoText: { color: "rgba(220,30,30,0.70)", fontSize: 12, lineHeight: 18 },
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
    // ── Styles pour le sélecteur CNTS ──
    cntsSelectBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: c.cardBorder,
      backgroundColor: c.cardBg + "80",
      paddingVertical: 14,
      paddingHorizontal: 14,
    },
    cntsSelectBtnActive: {
      borderColor: "rgba(34,197,94,0.5)",
      backgroundColor: "rgba(34,197,94,0.06)",
    },
    cntsSelectIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: "rgba(220,30,30,0.10)",
      alignItems: "center",
      justifyContent: "center",
    },
    cntsSelectLabel: { color: c.textSubtle, fontSize: 12, fontWeight: "500" },
    cntsSelectValue: {
      color: c.white,
      fontSize: 14,
      fontWeight: "700",
      marginTop: 2,
    },
    cntsSelectSub: { color: c.textMuted, fontSize: 11, marginTop: 2 },
    errorText: { color: "#EF4444", fontSize: 12, marginLeft: 4, marginTop: 4 },
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
  const form1 = useForm<HospitalStep1Values>({
    resolver: zodResolver(hospitalStep1Schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const form2 = useForm<HospitalStep2Values>({
    resolver: zodResolver(hospitalStep2Schema),
    defaultValues: {
      structureName: "",
      registrationNumber: "",
      address: "",
      region: undefined,
      structureType: undefined,
      latitude: undefined,
      longitude: undefined,
      structurePhone: "",
      structureEmail: "",
    },
  });

  const form3 = useForm<HospitalStep3Values>({
    resolver: zodResolver(hospitalStep3Schema),
    defaultValues: { affiliatedCntsId: "" },
  });

  const watchedPassword = form1.watch("password");
  const watchedLatitude = form2.watch("latitude");
  const watchedLongitude = form2.watch("longitude");

  // ── Géolocalisation ──
  const handleGeolocate = useCallback(async () => {
    setIsGeolocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted")
        throw new Error("Permission de localisation refusée.");
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

  // ── CNTS Selection ──
  const handleSelectCnts = (cnts: AvailableCnts) => {
    setSelectedCnts(cnts);
    form3.setValue("affiliatedCntsId", cnts.id, { shouldValidate: true });
  };

  // ── Navigation entre steps ──
  const handleNext = async (toStep: number) => {
    const form = toStep === 2 ? form1 : form2;
    await form.handleSubmit(
      () => {
        animateTransition();
        setCurrentStep(toStep);
      },
      () => {},
    )();
  };

  const handleSubmit = async () => {
    await form3.handleSubmit(
      async (step3Data) => {
        Keyboard.dismiss();
        const step1Data = form1.getValues();
        const step2Data = form2.getValues();

        const finalData: RegisterHospitalFormValues = {
          ...step1Data,
          ...step2Data,
          ...step3Data,
        };

        try {
          await registerHospital(finalData);
        } catch {}
      },
      () => {},
    )();
  };

  // ── Step 1 : Profil directeur ──
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <View style={styles.infoCard}>
        <View style={styles.infoIconWrap}>
          <Ionicons name="medkit-outline" size={18} color={colors.red} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.infoTitle}>Établissement de soins</Text>
          <Text style={styles.infoText}>
            Vous enregistrez un hôpital ou centre de santé. Le directeur recevra
            les droits HOSPITAL_AGENT.
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
            placeholder="Moussa"
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
            placeholder="Sow"
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
            placeholder="dr.sow@hopital.sn"
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

  // ── Step 2 : Infos Structure ──
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
              label="Nom de l'établissement"
              icon="business-outline"
              placeholder="Hôpital Principal de Dakar"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              autoCapitalize="words"
            />
          )}
        />
        <Controller
          control={form2.control}
          name="structureType"
          render={({ field, fieldState }) => (
            <FormSelect
              label="Type d'établissement"
              icon="medkit-outline"
              placeholder="Sélectionnez le type..."
              value={field.value}
              options={["HOSPITAL", "HEALTH_CENTER"]}
              onSelect={field.onChange}
              error={fieldState.error?.message}
              modalTitle="Type de structure"
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
              placeholder="SN-MED-2024-001"
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
              placeholder="Avenue Nelson Mandela"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              autoCapitalize="sentences"
            />
          )}
        />

        {/* Géolocalisation */}
        <View style={styles.geoWrapper}>
          <View style={styles.labelRow}>
            <Text style={styles.geoLabel}>Position GPS</Text>
            <Text style={styles.geoRequired}>* requis</Text>
          </View>
          <TouchableOpacity
            onPress={handleGeolocate}
            disabled={isGeolocating}
            activeOpacity={0.8}
            style={[
              styles.geoBtn,
              hasLocation ? styles.geoBtnSuccess : styles.geoBtnDefault,
              !!locationError && { borderColor: "#EF4444" },
            ]}
          >
            {isGeolocating ? (
              <>
                <ActivityIndicator size="small" color={colors.white} />
                <Text style={styles.geoBtnLabel}>Localisation...</Text>
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
                    {hasLocation
                      ? "Position enregistrée"
                      : "Localiser l'établissement"}
                  </Text>
                  {hasLocation ? (
                    <Text style={styles.geoBtnCoords}>
                      {watchedLatitude?.toFixed(5)},{" "}
                      {watchedLongitude?.toFixed(5)}
                    </Text>
                  ) : (
                    <Text style={styles.geoBtnSub}>
                      Nécessaire pour les alertes proches
                    </Text>
                  )}
                </View>
              </>
            )}
          </TouchableOpacity>
          {locationError && (
            <Text style={styles.errorText}>{locationError}</Text>
          )}
        </View>

        <Controller
          control={form2.control}
          name="structurePhone"
          render={({ field, fieldState }) => (
            <FormInput
              label="Tél. établissement"
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
              label="Email établissement"
              sublabel="(opt.)"
              icon="mail-outline"
              placeholder="contact@hopital.sn"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
      </View>
    );
  };

  // ── Step 3 : Affiliation CNTS ──
  const renderStep3 = () => {
    const cntsError = form3.formState.errors.affiliatedCntsId?.message;

    return (
      <View style={styles.stepContent}>
        <View style={styles.infoCard}>
          <View style={styles.infoIconWrap}>
            <Ionicons name="link-outline" size={18} color={colors.red} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.infoTitle}>Rattachement obligatoire</Text>
            <Text style={styles.infoText}>
              Tout hôpital ou centre de santé doit obligatoirement être affilié
              au Centre National de Transfusion Sanguine (CNTS) de sa région
              pour recevoir les alertes et le sang.
            </Text>
          </View>
        </View>

        {/* Sélecteur CNTS */}
        <View style={{ marginBottom: 16 }}>
          <View style={styles.labelRow}>
            <Text
              style={{
                color: colors.white,
                fontSize: 13,
                fontWeight: "600",
                opacity: 0.75,
              }}
            >
              CNTS d&apos;affiliation
            </Text>
            <Text
              style={{ color: colors.red, fontSize: 12, fontWeight: "600" }}
            >
              * requis
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setIsCntsSheetVisible(true)}
            activeOpacity={0.75}
            style={[
              styles.cntsSelectBtn,
              selectedCnts && styles.cntsSelectBtnActive,
            ]}
          >
            <View style={styles.cntsSelectIconWrap}>
              <Ionicons
                name="water-outline"
                size={18}
                color={selectedCnts ? colors.success : colors.red}
              />
            </View>
            <View style={{ flex: 1 }}>
              {selectedCnts ? (
                <>
                  <Text
                    style={[styles.cntsSelectLabel, { color: colors.success }]}
                  >
                    CNTS Sélectionné
                  </Text>
                  <Text style={styles.cntsSelectValue}>
                    {selectedCnts.name}
                  </Text>
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontSize: 11,
                      marginTop: 2,
                    }}
                  >
                    {selectedCnts.region} · {selectedCnts.address}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.cntsSelectLabel}>
                    Sélectionner une CNTS
                  </Text>
                  <Text style={styles.cntsSelectSub}>
                    Choisissez la CNTS régionale de rattachement
                  </Text>
                </>
              )}
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          {cntsError && <Text style={styles.errorText}>{cntsError}</Text>}
        </View>

        {/* Pending card */}
        <View style={styles.pendingCard}>
          <View style={styles.pendingIconWrap}>
            <Ionicons name="time-outline" size={18} color={colors.amber} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={styles.pendingTitle}>Vérification sous 24-48h</Text>
            <Text style={styles.pendingText}>
              Notre équipe et la CNTS sélectionnée valideront votre
              établissement avant activation du compte.
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

      {/* Modal de sélection CNTS */}
      <CntsSelectSheet
        visible={isCntsSheetVisible}
        onClose={() => setIsCntsSheetVisible(false)}
        onSelect={handleSelectCnts}
        selectedCntsId={selectedCnts?.id}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <TouchableOpacity
              onPress={() =>
                currentStep > 1
                  ? setCurrentStep(currentStep - 1)
                  : router.back()
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

          {/* Titre */}
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

          {/* Contenu */}
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
            <Animated.View
              style={{
                opacity: opacityAnim,
                transform: [{ translateY: slideAnim }],
                display: currentStep === 3 ? "flex" : "none",
              }}
            >
              {renderStep3()}
            </Animated.View>

            {/* Footer */}
            <View style={[styles.footer, { marginTop: 16 }]}>
              <TouchableOpacity
                onPress={() => {
                  if (currentStep === 1) handleNext(2);
                  else if (currentStep === 2) handleNext(3);
                  else handleSubmit();
                }}
                activeOpacity={0.85}
                style={[styles.ctaBtn, isPending && styles.ctaBtnDisabled]}
                disabled={isPending}
              >
                {isPending ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <>
                    <Text style={styles.ctaBtnText}>
                      {currentStep < 3 ? "Continuer" : "Soumettre la demande"}
                    </Text>
                    <View style={styles.ctaBtnIcon}>
                      <Ionicons
                        name={
                          currentStep < 3
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
