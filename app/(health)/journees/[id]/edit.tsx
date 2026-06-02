import React, { useState, useCallback, useRef, useEffect } from "react";
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
import { useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import * as ImagePicker from "expo-image-picker";
import { FormInput } from "@/src/components/ui/FormInput";
import { useSmartBack } from "@/src/hooks/useSmartBack";
import { useDayDetail, useUpdateDay } from "@/src/hooks/useDonationDays";
import { Image } from "expo-image";
import {
  dayStep1Schema,
  dayStep2Schema,
  type DayStep1Values,
  type DayStep2Values,
  DayStep3FormValues,
  dayStep3FormSchema,
} from "@/src/validators/donation-day.schema";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";
import { AppColors } from "@/src/theme/colors";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

// ─── Données statiques (Identiques à Create) ─────────────────
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

const STEPS = [
  {
    title: "L'événement",
    subtitle: "Titre, description et visuel",
    icon: "document-text-outline" as const,
  },
  {
    title: "Planification",
    subtitle: "Date, heure et lieu",
    icon: "calendar-outline" as const,
  },
  {
    title: "Objectifs",
    subtitle: "Cible et groupes sanguins",
    icon: "heart-outline" as const,
  },
];

// ─── Composants UI (Identiques à Create) ──────────────────────
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

function BloodTypeMultiSelect({
  values,
  onToggle,
  colors,
}: {
  values: string[];
  onToggle: (v: string) => void;
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
    check: { position: "absolute", top: 4, left: 4 },
  }));

  return (
    <View style={styles.bloodGrid}>
      {BLOOD_TYPES.map((bt) => {
        const selected = values.includes(bt.value);
        return (
          <TouchableOpacity
            key={bt.value}
            onPress={() => onToggle(bt.value)}
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
  );
}

// ─── Écran Principal d'Édition ────────────────────────────────
export default function EditJourneeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);
  const tabBarHeight = useBottomTabBarHeight();
  const goBack = useSmartBack({
    defaultRoute: `/(health)/journees/${id}`, // Retour au Détail de la journée
    routeMap: {
      detail: `/(health)/journees/${id}`,
      journees: "/(health)/journees",
    },
  });

  // ── Requêtes & Mutations ──
  const { data: day, isLoading: isLoadingDay } = useDayDetail(id);
  const { mutateAsync: updateDay, isPending } = useUpdateDay();

  const [currentStep, setCurrentStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

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
    titleBlock: { paddingHorizontal: 24, marginBottom: 4, gap: 4 },
    stepTitle: {
      color: c.white,
      fontSize: 26,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    stepSubtitle: { color: c.textMuted, fontSize: 14, lineHeight: 20 },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },
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
    optionalText: { color: c.textSubtle, fontWeight: "400" },
    imagePicker: {
      height: 160,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: c.cardBorder,
      backgroundColor: c.cardBg,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      marginBottom: 16,
    },
    imagePreview: { width: "100%", height: "100%" },
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
    datePickerText: { color: c.textMuted, fontSize: 14 },
    datePickerTextFilled: { color: c.white, fontWeight: "500" },
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
    iosPickerDoneText: { color: c.red, fontWeight: "700", fontSize: 15 },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 24,
      paddingBottom: 10,
      gap: 14,
      backgroundColor: colors.bg + "CC",
      paddingTop: 12,
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
    rowGap: { flexDirection: "row", gap: 12 },
    flex1: { flex: 1 },
    loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  }));

  // ── Forms par step ──
  const form1 = useForm<DayStep1Values>({
    resolver: zodResolver(dayStep1Schema),
    defaultValues: { title: "", description: "" },
  });

  const form2 = useForm<DayStep2Values>({
    resolver: zodResolver(dayStep2Schema),
    defaultValues: {
      scheduledDate: "",
      startTime: "08:00",
      endTime: "17:00",
      address: "",
    },
  });

  const form3 = useForm<DayStep3FormValues>({
    resolver: zodResolver(dayStep3FormSchema) as any,
    defaultValues: {
      targetDonors: "50",
      bloodTypesNeeded: [],
    },
  });

  // ── PRÉ-REMPLISSAGE DES DONNÉES ──
  useEffect(() => {
    if (day) {
      form1.reset({
        title: day.title || "",
        description: day.description || "",
      });
      form2.reset({
        scheduledDate: dayjs(day.scheduledDate).format("YYYY-MM-DD") || "",
        startTime: day.startTime || "08:00",
        endTime: day.endTime || "17:00",
        address: day.address || "",
      });
      form3.reset({
        targetDonors: day.targetDonors?.toString() || "50",
        bloodTypesNeeded: day.bloodTypesNeeded || [],
      });
      setImageUri(day.photoUrl || null);
    }
  }, [day]);

  const currentForm =
    currentStep === 1 ? form1 : currentStep === 2 ? form2 : form3;

  const navigation = useNavigation();

  // 3. Ajoute le useEffect (exactement comme sur CreateJourneeScreen)
  useEffect(() => {
    if (currentStep > 1) {
      const unsubscribe = navigation.addListener("beforeRemove", (e) => {
        e.preventDefault();
        setCurrentStep((s) => s - 1);
      });
      return unsubscribe;
    }
  }, [currentStep, navigation]);

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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleNext = async () => {
    await currentForm.handleSubmit(
      () => {
        animateTransition();
        setCurrentStep((s) => s + 1);
      },
      () => {},
    )();
  };

  // ── SOUMISSION DE L'ÉDITION ──
  const handleSubmit = async () => {
    await form3.handleSubmit(
      async (rawStep3Data) => {
        const step1Data = form1.getValues();
        const step2Data = form2.getValues();

        try {
          // On construit le payload uniquement avec les données modifiées
          // ou nécessaires. L'API gère le partial update.
          await updateDay({
            id: id,
            payload: {
              title: step1Data.title,
              description: step1Data.description,
              scheduledDate: step2Data.scheduledDate,
              startTime: step2Data.startTime,
              endTime: step2Data.endTime,
              address: step2Data.address,
              targetDonors: Number(rawStep3Data.targetDonors),
              bloodTypesNeeded: rawStep3Data.bloodTypesNeeded,
              photoUri: imageUri,
            },
          });

          goBack();
        } catch (err: any) {
          console.warn("Update day failed", err);
        }
      },
      () => {},
    )();
  };

  const openDatePicker = useCallback(
    (currentValue: string | undefined) => {
      const dateValue = currentValue ? new Date(currentValue) : new Date();
      if (Platform.OS === "android") {
        DateTimePickerAndroid.open({
          value: dateValue,
          mode: "date",
          minimumDate: new Date(),
          onChange: (_, date) => {
            if (date)
              form2.setValue(
                "scheduledDate",
                dayjs(date).format("YYYY-MM-DD"),
                { shouldValidate: true },
              );
          },
        });
      } else {
        setShowDatePicker(true);
      }
    },
    [form2],
  );

  const toggleBloodType = (value: string) => {
    const current = form3.getValues("bloodTypesNeeded") || [];
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    form3.setValue("bloodTypesNeeded", newValues, { shouldValidate: true });
  };

  // ── Steps Render (Identiques à Create) ──
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Controller
        control={form1.control}
        name="title"
        render={({ field, fieldState }) => (
          <FormInput
            label="Titre de l'événement"
            icon="text-outline"
            placeholder="Journée de don du 14 Juillet"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={form1.control}
        name="description"
        render={({ field, fieldState }) => (
          <FormInput
            label="Description"
            icon="document-text-outline"
            placeholder="Grande collecte ouverte à tous..."
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
            multiline
          />
        )}
      />
      <Text style={styles.fieldLabel}>
        Photo de couverture <Text style={styles.optionalText}>(optionnel)</Text>
      </Text>
      <TouchableOpacity
        style={styles.imagePicker}
        onPress={pickImage}
        activeOpacity={0.8}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
        ) : (
          <View style={{ alignItems: "center", gap: 8 }}>
            <Ionicons name="image-outline" size={32} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>
              Ajouter une photo
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.fieldLabel}>Date de l&apos;événement *</Text>
      <Controller
        control={form2.control}
        name="scheduledDate"
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
            {fieldState.error && (
              <Text style={{ color: "#EF4444", fontSize: 12, marginLeft: 4 }}>
                {fieldState.error.message}
              </Text>
            )}
            {showDatePicker && Platform.OS === "ios" && (
              <View style={styles.iosPickerContainer}>
                <DateTimePicker
                  value={field.value ? new Date(field.value) : new Date()}
                  mode="date"
                  minimumDate={new Date()}
                  onChange={(_, date) => {
                    if (date) field.onChange(dayjs(date).format("YYYY-MM-DD"));
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
          </View>
        )}
      />
      <View style={styles.rowGap}>
        <View style={styles.flex1}>
          <Controller
            control={form2.control}
            name="startTime"
            render={({ field, fieldState }) => (
              <FormInput
                label="Heure début"
                icon="time-outline"
                placeholder="08:00"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </View>
        <View style={styles.flex1}>
          <Controller
            control={form2.control}
            name="endTime"
            render={({ field, fieldState }) => (
              <FormInput
                label="Heure fin"
                icon="time-outline"
                placeholder="17:00"
                value={field.value}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </View>
      </View>
      <Controller
        control={form2.control}
        name="address"
        render={({ field, fieldState }) => (
          <FormInput
            label="Adresse"
            icon="location-outline"
            placeholder="Place de l'Indépendance"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Controller
        control={form3.control}
        name="targetDonors"
        render={({ field, fieldState }) => (
          <FormInput
            label="Objectif de donneurs"
            icon="people-outline"
            placeholder="50"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
            keyboardType="numeric"
          />
        )}
      />
      <Text style={styles.fieldLabel}>
        Groupes sanguins recherchés{" "}
        <Text style={styles.optionalText}>(Vide = tous)</Text>
      </Text>
      <Controller
        control={form3.control}
        name="bloodTypesNeeded"
        render={({ field }) => (
          <BloodTypeMultiSelect
            values={field.value || []}
            onToggle={toggleBloodType}
            colors={colors}
          />
        )}
      />
    </View>
  );

  const stepInfo = STEPS[currentStep - 1];

  // ── Loading initial ──
  if (isLoadingDay || !day) {
    return (
      <SafeAreaView style={[styles.container, styles.loader]} edges={["top"]}>
        <ActivityIndicator color={colors.red} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <View style={styles.haloTop} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              currentStep > 1 ? setCurrentStep((s) => s - 1) : goBack()
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
          <View style={styles.stepIconBadge}>
            <Ionicons name={stepInfo.icon} size={16} color={colors.red} />
          </View>
        </View>

        <Animated.View
          style={[
            styles.titleBlock,
            { opacity: opacityAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.stepTitle}>{stepInfo.title}</Text>
          <Text style={styles.stepSubtitle}>{stepInfo.subtitle}</Text>
        </Animated.View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent]}
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

        <View style={[styles.footer, { paddingBottom: 10 + tabBarHeight }]}>
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
                  {currentStep < 3
                    ? "Continuer"
                    : "Enregistrer les modifications"}
                </Text>
                <View style={styles.ctaBtnIcon}>
                  <Ionicons
                    name={
                      currentStep < 3 ? "arrow-forward" : "checkmark-outline"
                    }
                    size={17}
                    color={colors.white}
                  />
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
