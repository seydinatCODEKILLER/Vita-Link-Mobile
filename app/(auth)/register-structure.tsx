import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { FormSelect } from "@/src/components/ui/FormSelect";
import { SENEGAL_REGIONS } from "@/src/validators/auth.schema";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/src/components/ui/FormInput";
import { useRegisterHealthStructure } from "@/src/hooks/useAuth";
import {
  structureStep1Schema,
  structureStep2Schema,
  type StructureStep1Values,
  type StructureStep2Values,
  type RegisterStructureFormValues,
} from "@/src/validators/auth.schema";

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
  success: "#22C55E",
  amber: "#FAC775",
} as const;

// ─── Config steps ──────────────────────────────────────────────
const STEPS = [
  {
    title: "Votre profil",
    subtitle: "Informations du directeur / responsable",
    icon: "person-outline" as const,
  },
  {
    title: "Votre structure",
    subtitle: "Informations de l'établissement",
    icon: "business-outline" as const,
  },
];

// ─── Indicateur force du mot de passe ─────────────────────────
function PasswordStrength({ password }: { password: string }) {
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
export default function RegisterStructureScreen() {
  const router = useRouter();
  const { mutateAsync: registerStructure, isPending } =
    useRegisterHealthStructure();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<
    Partial<RegisterStructureFormValues>
  >({});

  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Entrée initiale
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
  const form1 = useForm<StructureStep1Values>({
    resolver: zodResolver(structureStep1Schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const form2 = useForm<StructureStep2Values>({
    resolver: zodResolver(structureStep2Schema),
    defaultValues: {
      structureName: "",
      registrationNumber: "",
      address: "",
      region: undefined,
      structurePhone: "",
      structureEmail: "",
    },
  });

  const watchedPassword = form1.watch("password");

  // ── Step 1 → Step 2 ──
  const handleNext = async () => {
    await form1.handleSubmit(
      (data) => {
        setFormData((prev) => ({ ...prev, ...data }));
        animateTransition();
        setCurrentStep(2);
      },
      () => {},
    )();
  };

  // ── Submit final ──
  const handleSubmit = async () => {
    await form2.handleSubmit(
      async (data) => {
        Keyboard.dismiss();
        const finalData = {
          ...formData,
          ...data,
        } as RegisterStructureFormValues;

        try {
          await registerStructure({
            firstName: finalData.firstName,
            lastName: finalData.lastName,
            email: finalData.email,
            phone: finalData.phone,
            password: finalData.password,
            structureName: finalData.structureName,
            registrationNumber: finalData.registrationNumber,
            region: finalData.region,
            address: finalData.address,
            structurePhone: finalData.structurePhone || undefined,
            structureEmail: finalData.structureEmail || undefined,
          });
          // Navigation → pending-review gérée dans useRegisterHealthStructure
        } catch {
          // Toast géré dans le hook
        }
      },
      () => {},
    )();
  };

  // ─── Step 1 : Directeur ───────────────────────────────────────
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      {/* Prénom + Nom */}
      <View style={styles.nameRow}>
        <View style={{ flex: 1 }}>
          <Controller
            control={form1.control}
            name="firstName"
            render={({ field, fieldState }) => (
              <FormInput
                label="Prénom"
                icon="person-outline"
                placeholder="Moussa"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
                autoCapitalize="words"
              />
            )}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Controller
            control={form1.control}
            name="lastName"
            render={({ field, fieldState }) => (
              <FormInput
                label="Nom"
                icon="person-outline"
                placeholder="Sow"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
                autoCapitalize="words"
              />
            )}
          />
        </View>
      </View>

      <Controller
        control={form1.control}
        name="email"
        render={({ field, fieldState }) => (
          <FormInput
            label="Email professionnel"
            icon="mail-outline"
            placeholder="directeur@hopital.sn"
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

      {/* Indicateur force */}
      <PasswordStrength password={watchedPassword} />

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

  // ─── Step 2 : Structure ───────────────────────────────────────
  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Controller
        control={form2.control}
        name="structureName"
        render={({ field, fieldState }) => (
          <FormInput
            label="Nom de la structure"
            icon="business-outline"
            placeholder="CHNU de Fann"
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
            placeholder="SN-MS-2024-0042"
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
            placeholder="Avenue Cheikh Anta Diop, Dakar"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
            autoCapitalize="sentences"
          />
        )}
      />

      {/* Téléphone + Email structure — optionnels en ligne */}
      <View style={styles.nameRow}>
        <View style={{ flex: 1 }}>
          <Controller
            control={form2.control}
            name="structurePhone"
            render={({ field, fieldState }) => (
              <FormInput
                label="Tél. structure"
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
        </View>
        <View style={{ flex: 1 }}>
          <Controller
            control={form2.control}
            name="structureEmail"
            render={({ field, fieldState }) => (
              <FormInput
                label="Email structure"
                sublabel="(opt.)"
                icon="mail-outline"
                placeholder="contact@..."
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />
        </View>
      </View>

      {/* Info PENDING_REVIEW */}
      <View style={styles.pendingCard}>
        <View style={styles.pendingIconWrap}>
          <Ionicons name="time-outline" size={18} color={COLORS.amber} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={styles.pendingTitle}>Vérification sous 24-48h</Text>
          <Text style={styles.pendingText}>
            Notre équipe examinera votre demande avant d&apos;activer
            l&apos;accès à votre structure.
          </Text>
        </View>
      </View>
    </View>
  );

  // ─── Rendu principal ──────────────────────────────────────────
  const stepInfo = STEPS[currentStep - 1];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.haloTop} />
      <View style={styles.haloBottom} />

      <SafeAreaView style={styles.safeArea}>
        {/* ── Header ── */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity
            onPress={() =>
              currentStep > 1 ? setCurrentStep(1) : router.back()
            }
            style={styles.backBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={19} color={COLORS.white} />
          </TouchableOpacity>

          {/* Progress */}
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

          {/* Icon badge */}
          <View style={styles.stepIconBadge}>
            <Ionicons name={stepInfo.icon} size={16} color={COLORS.red} />
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

        {/* ── Contenu scrollable ── */}
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
            }}
          >
            {currentStep === 1 ? renderStep1() : renderStep2()}
          </Animated.View>
        </ScrollView>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={currentStep === 1 ? handleNext : handleSubmit}
            activeOpacity={0.85}
            style={[styles.ctaBtn, isPending && styles.ctaBtnDisabled]}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Text style={styles.ctaBtnText}>
                  {currentStep === 1 ? "Continuer" : "Soumettre la demande"}
                </Text>
                <View style={styles.ctaBtnIcon}>
                  <Ionicons
                    name={
                      currentStep === 1 ? "arrow-forward" : "checkmark-outline"
                    }
                    size={17}
                    color={COLORS.white}
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
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  safeArea: { flex: 1 },

  haloTop: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.redGlow,
  },
  haloBottom: {
    position: "absolute",
    bottom: 60,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(220,30,30,0.07)",
  },

  // ── Header ──
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
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  progressRow: {
    flexDirection: "row",
    gap: 6,
    width: "100%",
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  progressActive: { backgroundColor: COLORS.red },
  progressInactive: { backgroundColor: COLORS.cardBorder },
  stepCounter: {
    color: COLORS.textMuted,
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

  // ── Titre ──
  titleBlock: {
    paddingHorizontal: 24,
    marginBottom: 4,
    gap: 3,
  },
  eyebrow: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2,
  },
  title: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },

  // ── Scroll ──
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  stepContent: { gap: 2 },

  nameRow: {
    flexDirection: "row",
    gap: 12,
  },

  // ── Password strength ──
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
  strengthText: {
    fontSize: 11,
    flex: 1,
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
    color: COLORS.amber,
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
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 10,
    gap: 14,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.red,
    borderRadius: 16,
    paddingVertical: 17,
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
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: { color: COLORS.textMuted, fontSize: 14 },
  loginLink: { color: COLORS.red, fontSize: 14, fontWeight: "700" },
});
