import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { FormInput } from "@/src/components/ui/FormInput";
import { useRegisterDonor } from "@/src/hooks/useAuth";
import {
  donorStep1Schema,
  donorStep2Schema,
  donorStep3Schema,
  type DonorStep1Values,
  type DonorStep2Values,
  type DonorStep3Values,
  type RegisterDonorFormValues,
} from "@/src/validators/auth.schema";
import { registrationManager } from "@/src/utils/registration.utils";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";
import { AppColors } from "@/src/theme/colors";

// ─── Données statiques ─────────────────────────────────────────
const BLOOD_TYPES = [
  { value: "A_POS", label: "A+" },
  { value: "A_NEG", label: "A−" },
  { value: "B_POS", label: "B+" },
  { value: "B_NEG", label: "B−" },
  { value: "AB_POS", label: "AB+" },
  { value: "AB_NEG", label: "AB−" },
  { value: "O_POS", label: "O+" },
  { value: "O_NEG", label: "O−" },
] as const;

const GENDERS = [
  { value: "MALE", label: "Homme", icon: "male-outline" as const },
  { value: "FEMALE", label: "Femme", icon: "female-outline" as const },
] as const;

const STEPS = [
  {
    title: "Qui êtes-vous ?",
    subtitle: "Vos informations personnelles",
    icon: "person-outline" as const,
  },
  {
    title: "Vos coordonnées",
    subtitle: "Pour recevoir votre code OTP",
    icon: "mail-outline" as const,
  },
  {
    title: "Profil médical",
    subtitle: "Votre groupe sanguin",
    icon: "heart-outline" as const,
  },
];

// ─── Step Progress Bar ─────────────────────────────────────────
function StepProgress({
  current,
  total,
  colors,
}: {
  current: number;
  total: number;
  colors: AppColors;
}) {
  const styles = useThemedStyles((c) => ({
    progressRow: { flexDirection: "row", gap: 6, width: "100%" },
    progressSegment: { flex: 1, height: 3, borderRadius: 2 },
    active: { backgroundColor: c.red },
    inactive: { backgroundColor: c.cardBorder },
  }));

  return (
    <View style={styles.progressRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.progressSegment,
            i < current ? styles.active : styles.inactive,
          ]}
        />
      ))}
    </View>
  );
}

// ─── Gender Selector ───────────────────────────────────────────
function GenderSelector({
  value,
  onChange,
  error,
  colors,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  error?: string;
  colors: AppColors;
}) {
  const styles = useThemedStyles((c) => ({
    genderRow: { flexDirection: "row", gap: 12, marginBottom: 4 },
    genderBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1.5,
      position: "relative",
    },
    defaultBtn: { backgroundColor: c.cardBg, borderColor: c.cardBorder },
    selectedBtn: {
      backgroundColor: "rgba(220,30,30,0.12)",
      borderColor: c.red,
    },
    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    defaultIcon: { backgroundColor: "rgba(255,255,255,0.06)" },
    selectedIcon: { backgroundColor: c.red },
    label: { color: c.textMuted, fontSize: 14, fontWeight: "600", flex: 1 },
    selectedLabel: { color: c.white },
    check: { position: "absolute", top: 8, right: 8 },
    errorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 4,
      marginLeft: 2,
    },
    errorText: { color: "#EF4444", fontSize: 12, flex: 1 },
  }));

  return (
    <View style={{ gap: 8 }}>
      <View style={styles.genderRow}>
        {GENDERS.map((g) => {
          const selected = value === g.value;
          return (
            <TouchableOpacity
              key={g.value}
              onPress={() => onChange(g.value)}
              activeOpacity={0.75}
              style={[
                styles.genderBtn,
                selected ? styles.selectedBtn : styles.defaultBtn,
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  selected ? styles.selectedIcon : styles.defaultIcon,
                ]}
              >
                <Ionicons
                  name={g.icon}
                  size={20}
                  color={selected ? colors.white : colors.textMuted}
                />
              </View>
              <Text style={[styles.label, selected && styles.selectedLabel]}>
                {g.label}
              </Text>
              {selected && (
                <View style={styles.check}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={colors.white}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Blood Type Grid ───────────────────────────────────────────
function BloodTypeGrid({
  value,
  onChange,
  error,
  colors,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  error?: string;
  colors: AppColors;
}) {
  const styles = useThemedStyles((c) => ({
    bloodGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    cell: {
      width: "22%",
      aspectRatio: 1,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      position: "relative",
    },
    defaultCell: { backgroundColor: c.cardBg, borderColor: c.cardBorder },
    selectedCell: { backgroundColor: c.red, borderColor: c.red },
    defaultLabel: { color: c.textMuted, fontSize: 17, fontWeight: "800" },
    selectedLabel: { color: c.white },
    rareBadge: {
      position: "absolute",
      top: 4,
      right: 4,
      backgroundColor: "rgba(250,199,117,0.18)",
      paddingHorizontal: 4,
      paddingVertical: 1,
      borderRadius: 4,
    },
    rareBadgeSelected: { backgroundColor: "rgba(255,255,255,0.20)" },
    rareText: { color: c.amber, fontSize: 8, fontWeight: "700" },
    check: { position: "absolute", top: 4, left: 4 },
    errorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 4,
      marginLeft: 2,
    },
    errorText: { color: "#EF4444", fontSize: 12, flex: 1 },
  }));

  return (
    <View style={{ gap: 10 }}>
      <View style={styles.bloodGrid}>
        {BLOOD_TYPES.map((bt) => {
          const selected = value === bt.value;
          const isRare = bt.value === "O_NEG" || bt.value === "AB_NEG";
          return (
            <TouchableOpacity
              key={bt.value}
              onPress={() => onChange(bt.value)}
              activeOpacity={0.75}
              style={[
                styles.cell,
                selected ? styles.selectedCell : styles.defaultCell,
              ]}
            >
              <Text
                style={[styles.defaultLabel, selected && styles.selectedLabel]}
              >
                {bt.label}
              </Text>
              {isRare && (
                <View
                  style={[
                    styles.rareBadge,
                    selected && styles.rareBadgeSelected,
                  ]}
                >
                  <Text style={styles.rareText}>Rare</Text>
                </View>
              )}
              {selected && (
                <View style={styles.check}>
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={colors.white}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function RegisterDonorScreen() {
  const router = useRouter();
  const { mutateAsync: registerDonor, isPending } = useRegisterDonor();
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);

  const [currentStep, setCurrentStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState<Partial<RegisterDonorFormValues>>(
    {},
  );

  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    safeArea: { flex: 1 },
    haloTop: {
      position: "absolute",
      top: -100,
      right: -80,
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor: c.redGlow,
    },
    haloBottom: {
      position: "absolute",
      bottom: 80,
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
    headerCenter: {
      flex: 1,
      alignItems: "center",
      gap: 6,
    },
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
    titleBlock: {
      paddingHorizontal: 24,
      marginBottom: 4,
      gap: 4,
    },
    stepTitle: {
      color: c.white,
      fontSize: 26,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    stepSubtitle: {
      color: c.textMuted,
      fontSize: 14,
      lineHeight: 20,
    },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 24,
    },
    stepContent: { gap: 2 },
    fieldLabel: {
      color: c.white,
      fontSize: 13,
      fontWeight: "600",
      letterSpacing: 0.3,
      marginBottom: 10,
      marginTop: 4,
      opacity: 0.75,
    },
    optionalText: {
      color: c.textSubtle,
      fontWeight: "400",
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    rareLegend: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    rareLegendText: {
      color: c.textMuted,
      fontSize: 11,
    },
    rareBadge: {
      backgroundColor: "rgba(250,199,117,0.18)",
      paddingHorizontal: 4,
      paddingVertical: 1,
      borderRadius: 4,
    },
    rareText: { color: c.amber, fontSize: 8, fontWeight: "700" },
    divider: {
      height: 1,
      backgroundColor: c.cardBorder,
      marginVertical: 20,
    },
    datePickerBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: c.inputBg,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: c.cardBorder,
      padding: 15,
    },
    datePickerBtnFilled: {
      borderColor: "rgba(220,30,30,0.35)",
      backgroundColor: "rgba(220,30,30,0.06)",
    },
    datePickerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },
    datePickerText: {
      color: c.textMuted,
      fontSize: 14,
    },
    datePickerTextFilled: {
      color: c.white,
      fontWeight: "500",
    },
    iosPickerContainer: {
      backgroundColor: c.cardBg,
      borderRadius: 14,
      marginTop: 8,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    iosPickerDone: {
      alignItems: "flex-end",
      padding: 12,
      borderTopWidth: 1,
      borderColor: c.cardBorder,
    },
    iosPickerDoneText: {
      color: c.red,
      fontWeight: "700",
      fontSize: 15,
    },
    infoCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      backgroundColor: "rgba(34,197,94,0.07)",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "rgba(34,197,94,0.18)",
      padding: 14,
      marginTop: 4,
    },
    infoCardIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: "rgba(34,197,94,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    infoCardTitle: {
      color: c.success,
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 2,
    },
    infoCardText: {
      color: "rgba(34,197,94,0.70)",
      fontSize: 12,
      lineHeight: 18,
    },
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
      backgroundColor: c.red,
      borderRadius: 16,
      paddingVertical: 17,
    },
    ctaBtnDisabled: { opacity: 0.55 },
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

  const animateTransition = useCallback(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: -16,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [slideAnim, opacityAnim]);

  // ── Forms par step ──
  const form1 = useForm<DonorStep1Values>({
    resolver: zodResolver(donorStep1Schema),
    defaultValues: {
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      gender: formData.gender,
    } as DonorStep1Values,
  });

  const form2 = useForm<DonorStep2Values>({
    resolver: zodResolver(donorStep2Schema),
    defaultValues: {
      phone: formData.phone || "",
      email: formData.email || "",
    } as DonorStep2Values,
  });

  const form3 = useForm<DonorStep3Values>({
    resolver: zodResolver(donorStep3Schema),
    defaultValues: {
      bloodType: formData.bloodType,
      dateOfBirth: formData.dateOfBirth,
    } as DonorStep3Values,
  });

  const currentForm =
    currentStep === 1 ? form1 : currentStep === 2 ? form2 : form3;

  // ── Handler Next ──
  const handleNext = async () => {
    await currentForm.handleSubmit(
      (data) => {
        setFormData((prev) => ({ ...prev, ...data }));
        animateTransition();
        setCurrentStep((s) => s + 1);
      },
      () => {},
    )();
  };

  // ── Handler Submit final ──
  const handleSubmit = async () => {
    const valid = await form3.trigger();
    if (!valid) return;

    const step3Data = form3.getValues();
    const finalData = { ...formData, ...step3Data } as RegisterDonorFormValues;

    try {
      await registerDonor({
        firstName: finalData.firstName,
        lastName: finalData.lastName,
        phone: finalData.phone,
        email: finalData.email,
        bloodType: finalData.bloodType,
        gender: finalData.gender,
        dateOfBirth: finalData.dateOfBirth
          ? new Date(finalData.dateOfBirth).toISOString()
          : undefined,
      });

      await registrationManager.savePendingDonor(finalData);

      router.push({
        pathname: "/otp-verify",
        params: {
          email: finalData.email,
          phone: finalData.phone,
          firstName: finalData.firstName,
          lastName: finalData.lastName,
          bloodType: finalData.bloodType,
          gender: finalData.gender,
          dateOfBirth: finalData.dateOfBirth
            ? new Date(finalData.dateOfBirth).toISOString()
            : "",
        },
      });
    } catch (err: any) {
      console.warn("Register donor failed", err);
    }
  };

  // ── DatePicker helper ──
  const openDatePicker = useCallback(
    (currentValue: string | undefined) => {
      const dateValue = currentValue
        ? new Date(currentValue)
        : new Date(2000, 0, 1);

      if (Platform.OS === "android") {
        DateTimePickerAndroid.open({
          value: dateValue,
          mode: "date",
          maximumDate: new Date(),
          minimumDate: new Date(1920, 0, 1),
          onChange: (_, date) => {
            if (date)
              form3.setValue("dateOfBirth", date.toISOString(), {
                shouldValidate: true,
              });
          },
        });
      } else {
        setShowDatePicker(true);
      }
    },
    [form3],
  );

  // ── Step 1 : Identité ──
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Controller
        control={form1.control}
        name="firstName"
        render={({ field, fieldState }) => (
          <FormInput
            label="Prénom"
            icon="person-outline"
            placeholder="Aliou"
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
            label="Nom"
            icon="person-outline"
            placeholder="Diallo"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
            autoCapitalize="words"
          />
        )}
      />

      <Text style={styles.fieldLabel}>Genre *</Text>
      <Controller
        control={form1.control}
        name="gender"
        render={({ field, fieldState }) => (
          <GenderSelector
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            colors={colors}
          />
        )}
      />
    </View>
  );

  // ── Step 2 : Coordonnées ──
  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Controller
        control={form2.control}
        name="phone"
        render={({ field, fieldState }) => (
          <FormInput
            label="Numéro de téléphone"
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
        control={form2.control}
        name="email"
        render={({ field, fieldState }) => (
          <FormInput
            label="Adresse email"
            icon="mail-outline"
            placeholder="aliou@gmail.com"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
      />

      {/* Info card OTP */}
      <View style={styles.infoCard}>
        <View style={styles.infoCardIcon}>
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color={colors.success}
          />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.infoCardTitle}>Vérification par email</Text>
          <Text style={styles.infoCardText}>
            Un code OTP à 6 chiffres sera envoyé à cette adresse pour valider
            votre inscription.
          </Text>
        </View>
      </View>
    </View>
  );

  // ── Step 3 : Profil médical ── ✅ CORRECTION APPLIQUÉE ICI
  const renderStep3 = () => (
    <View style={styles.stepContent}>
      {/* Section groupe sanguin */}
      <View style={styles.sectionHeader}>
        <Text style={styles.fieldLabel}>Groupe sanguin <Text style={styles.optionalText}>(optionnel)</Text></Text>
        <View style={styles.rareLegend}>
          <View style={styles.rareBadge}>
            <Text style={styles.rareText}>Rare</Text>
          </View>
          {/* ✅ CORRECTION : Ajout du '>' manquant pour le composant Text */}
          <Text style={styles.rareLegendText}>= groupe rare</Text>
        </View>
      </View>

      <Controller
        control={form3.control}
        name="bloodType"
        render={({ field, fieldState }) => (
          <BloodTypeGrid
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            colors={colors}
          />
        )}
      />

      <View style={styles.divider} />

      {/* Date de naissance */}
      <Text style={styles.fieldLabel}>
        Date de naissance <Text style={styles.optionalText}>(optionnel)</Text>
      </Text>
      <Controller
        control={form3.control}
        name="dateOfBirth"
        render={({ field, fieldState }) => (
          <View style={{ gap: 6 }}>
            <TouchableOpacity
              onPress={() => openDatePicker(field.value)}
              activeOpacity={0.75}
              style={[
                styles.datePickerBtn,
                field.value && styles.datePickerBtnFilled,
              ]}
            >
              <View style={styles.datePickerLeft}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={field.value ? colors.red : colors.textMuted}
                />
                <Text
                  style={[
                    styles.datePickerText,
                    field.value && styles.datePickerTextFilled,
                  ]}
                >
                  {field.value
                    ? dayjs(field.value).format("DD MMMM YYYY")
                    : "Sélectionner une date"}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={field.value ? colors.red : colors.textMuted}
              />
            </TouchableOpacity>

            {/* iOS inline picker */}
            {showDatePicker && Platform.OS === "ios" && (
              <View style={styles.iosPickerContainer}>
                <DateTimePicker
                  value={
                    field.value ? new Date(field.value) : new Date(2000, 0, 1)
                  }
                  mode="date"
                  maximumDate={new Date()}
                  minimumDate={new Date(1920, 0, 1)}
                  onChange={(_, date) => {
                    if (date) field.onChange(date.toISOString());
                  }}
                  display="spinner"
                  themeVariant={theme === "dark" ? "dark" : "light"}
                />
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  style={styles.iosPickerDone}
                >
                  <Text style={styles.iosPickerDoneText}>Confirmer</Text>
                </TouchableOpacity>
              </View>
            )}

            {fieldState.error && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 4,
                  marginLeft: 2,
                }}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={13}
                  color="#EF4444"
                />
                <Text style={{ color: "#EF4444", fontSize: 12, flex: 1 }}>
                  {fieldState.error.message}
                </Text>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );

  // ─── Rendu principal ──────────────────────────────────────────
  const stepInfo = STEPS[currentStep - 1];

  return (
    <View style={styles.container}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      {/* Halos décoratifs */}
      <View style={styles.haloTop} />
      <View style={styles.haloBottom} />

      <SafeAreaView style={styles.safeArea}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              currentStep > 1 ? setCurrentStep((s) => s - 1) : router.back()
            }
            style={styles.backBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={19} color={colors.white} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <StepProgress
              current={currentStep}
              total={STEPS.length}
              colors={colors}
            />
            <Text style={styles.stepCounter}>
              {currentStep} / {STEPS.length}
            </Text>
          </View>

          {/* Badge step */}
          <View style={styles.stepIconBadge}>
            <Ionicons name={stepInfo.icon} size={16} color={colors.red} />
          </View>
        </View>

        {/* ── Titre du step ── */}
        <Animated.View
          style={[
            styles.titleBlock,
            {
              opacity: opacityAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.stepTitle}>{stepInfo.title}</Text>
          <Text style={styles.stepSubtitle}>{stepInfo.subtitle}</Text>
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
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </Animated.View>
        </ScrollView>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={currentStep < 3 ? handleNext : handleSubmit}
            activeOpacity={0.85}
            style={[styles.ctaBtn, isPending && styles.ctaBtnDisabled]}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                <Text style={styles.ctaBtnText}>
                  {currentStep < 3 ? "Continuer" : "Recevoir mon code OTP"}
                </Text>
                <View style={styles.ctaBtnIcon}>
                  <Ionicons
                    name={currentStep < 3 ? "arrow-forward" : "mail-outline"}
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
      </SafeAreaView>
    </View>
  );
}
