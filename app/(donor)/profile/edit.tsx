import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { StatusBar } from "expo-status-bar";
import { FormInput } from "@/src/components/ui/FormInput";
import { useAuthStore } from "@/src/store/auth.store";
import { usersApi } from "@/src/api/users.api";
import { UpdateProfilePayload, User } from "@/src/types/user.types";
import { Gender } from "@/src/types/shared.types";
import {
  editProfileSchema,
  EditProfileValues,
} from "@/src/validators/profile.schema";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
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

// ─── GenderSelector ────────────────────────────────────────────
function GenderSelector({
  value,
  onChange,
  colors,
}: {
  value: string | undefined | null;
  onChange: (v: string) => void;
  colors: AppColors;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 12, marginBottom: 8 }}>
      {GENDERS.map((g) => {
        const selected = value === g.value;
        return (
          <TouchableOpacity
            key={g.value}
            onPress={() => onChange(g.value)}
            activeOpacity={0.75}
            style={[
              {
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                padding: 14,
                borderRadius: 14,
                borderWidth: 1.5,
              },
              selected
                ? {
                    backgroundColor: "rgba(220,30,30,0.12)",
                    borderColor: colors.red,
                  }
                : {
                    backgroundColor: colors.inputBg,
                    borderColor: "rgba(255,255,255,0.10)",
                  },
            ]}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: selected
                  ? colors.red
                  : "rgba(255,255,255,0.06)",
              }}
            >
              <Ionicons
                name={g.icon}
                size={20}
                color={selected ? "#FFFFFF" : colors.textMuted}
              />
            </View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: selected ? colors.white : colors.textMuted,
              }}
            >
              {g.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── BloodTypeGrid ─────────────────────────────────────────────
function BloodTypeGrid({
  value,
  onChange,
  colors,
}: {
  value: string | undefined | null;
  onChange: (v: string) => void;
  colors: AppColors;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 8,
      }}
    >
      {BLOOD_TYPES.map((bt) => {
        const selected = value === bt.value;
        return (
          <TouchableOpacity
            key={bt.value}
            onPress={() => onChange(bt.value)}
            activeOpacity={0.75}
            style={{
              width: "22%",
              aspectRatio: 1,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              backgroundColor: selected ? colors.red : colors.inputBg,
              borderColor: selected ? colors.red : "rgba(255,255,255,0.10)",
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "800",
                color: selected ? "#FFFFFF" : colors.textMuted,
              }}
            >
              {bt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Écran Principal ───────────────────────────────────────────
export default function EditProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

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

    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 16,
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
    headerTitle: { color: c.white, fontSize: 18, fontWeight: "800" },
    saveBtn: { color: c.red, fontSize: 16, fontWeight: "700" },

    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    // Avatar
    avatarSection: {
      alignItems: "center",
      gap: 10,
      marginBottom: 28,
      paddingTop: 10,
    },
    avatarImage: { width: 96, height: 96, borderRadius: 28 },
    avatarPlaceholder: {
      width: 96,
      height: 96,
      borderRadius: 28,
      backgroundColor: c.cardBg,
      borderWidth: 1.5,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarHint: { color: c.textMuted, fontSize: 13, fontWeight: "500" },

    // Sections
    sectionTitle: {
      color: c.textSubtle,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1.5,
      marginBottom: 12,
    },
    formBlock: {
      backgroundColor: c.cardBg,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.cardBorder,
      padding: 16,
      marginBottom: 24,
      gap: 4,
    },
    fieldLabel: {
      color: c.white,
      fontSize: 13,
      fontWeight: "600",
      letterSpacing: 0.3,
      marginBottom: 10,
      opacity: 0.75,
    },
    optionalText: { color: c.textSubtle, fontWeight: "400" },
    divider: {
      height: 1,
      backgroundColor: c.cardBorder,
      marginVertical: 16,
    },
    errorText: { color: "#EF4444", fontSize: 12, marginTop: 6, marginLeft: 4 },

    // Date Picker
    datePickerBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: c.inputBg,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: "rgba(255,255,255,0.10)",
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
  }));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      gender: user?.gender || undefined,
      bloodType: user?.bloodType || undefined,
      dateOfBirth: user?.dateOfBirth || null,
    },
  });

  // ── Upload Avatar ──
  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission requise",
        "Autorisez l'accès à la galerie pour changer votre photo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    setIsUploading(true);
    try {
      const updatedUser = await usersApi.updateAvatar(uri);
      await updateUser({ avatarUrl: updatedUser.avatarUrl });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("Erreur", "Impossible de mettre à jour la photo de profil.");
    } finally {
      setIsUploading(false);
    }
  };

  // ── Date Picker ──
  const openDatePicker = useCallback(() => {
    const currentValue = watch("dateOfBirth");
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
            setValue("dateOfBirth", date.toISOString(), {
              shouldValidate: true,
            });
        },
      });
    } else {
      setShowDatePicker(true);
    }
  }, [watch, setValue]);

  // ── Submit ──
  const onSubmit = async (data: EditProfileValues) => {
    setIsSaving(true);
    try {
      const payload: UpdateProfilePayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender as Gender | undefined,
        bloodType: data.bloodType,
        dateOfBirth: data.dateOfBirth ?? undefined,
      };

      const updatedUser: User = await usersApi.updateProfile(payload);

      if (data.bloodType && data.bloodType !== user?.bloodType) {
        // call spécifique groupe sanguin si besoin
      }

      await updateUser({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        gender: updatedUser.gender,
        bloodType: updatedUser.bloodType,
        dateOfBirth: updatedUser.dateOfBirth,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error: any) {
      Alert.alert(
        "Mise à jour échouée",
        error?.response?.data?.message || "Une erreur est survenue.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.haloTop} />

      <SafeAreaView style={styles.safeArea}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={19} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modifier le profil</Text>
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.red} />
            ) : (
              <Text style={styles.saveBtn}>Enregistrer</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* ── Avatar Section ── */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                onPress={handlePickImage}
                activeOpacity={0.8}
                disabled={isUploading}
              >
                <View style={{ position: "relative" }}>
                  {user?.avatarUrl ? (
                    <Image
                      source={{ uri: user.avatarUrl }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons
                        name="person"
                        size={36}
                        color={colors.textSubtle}
                      />
                    </View>
                  )}
                  <View
                    style={{
                      position: "absolute",
                      bottom: -4,
                      right: -4,
                      width: 28,
                      height: 28,
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: colors.bg,
                      backgroundColor: isUploading ? colors.cardBg : colors.red,
                    }}
                  >
                    {isUploading ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Ionicons name="camera" size={11} color="#FFFFFF" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarHint}>Changer la photo de profil</Text>
            </View>

            {/* ── Identité ── */}
            <Text style={styles.sectionTitle}>IDENTITÉ</Text>
            <View style={styles.formBlock}>
              <Controller
                control={control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Prénom"
                    icon="person-outline"
                    placeholder="Votre prénom"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="lastName"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Nom"
                    icon="person-outline"
                    placeholder="Votre nom"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />

              <Text style={styles.fieldLabel}>Genre</Text>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <GenderSelector
                    value={field.value}
                    onChange={field.onChange}
                    colors={colors}
                  />
                )}
              />
            </View>

            {/* ── Profil Médical ── */}
            <Text style={styles.sectionTitle}>PROFIL MÉDICAL</Text>
            <View style={styles.formBlock}>
              <Text style={styles.fieldLabel}>Groupe sanguin *</Text>
              <Controller
                control={control}
                name="bloodType"
                render={({ field, fieldState }) => (
                  <View>
                    <BloodTypeGrid
                      value={field.value}
                      onChange={field.onChange}
                      colors={colors}
                    />
                    {fieldState.error && (
                      <Text style={styles.errorText}>
                        {fieldState.error.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              <View style={styles.divider} />

              <Text style={styles.fieldLabel}>
                Date de naissance{" "}
                <Text style={styles.optionalText}>(optionnel)</Text>
              </Text>
              <Controller
                control={control}
                name="dateOfBirth"
                render={({ field }) => (
                  <View>
                    <TouchableOpacity
                      onPress={openDatePicker}
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
                    </TouchableOpacity>

                    {showDatePicker && Platform.OS === "ios" && (
                      <View style={styles.iosPickerContainer}>
                        <DateTimePicker
                          value={
                            field.value
                              ? new Date(field.value)
                              : new Date(2000, 0, 1)
                          }
                          mode="date"
                          maximumDate={new Date()}
                          minimumDate={new Date(1920, 0, 1)}
                          onChange={(_, date) => {
                            if (date) field.onChange(date.toISOString());
                          }}
                          display="spinner"
                          themeVariant="dark"
                        />
                        <TouchableOpacity
                          onPress={() => setShowDatePicker(false)}
                          style={styles.iosPickerDone}
                        >
                          <Text style={styles.iosPickerDoneText}>
                            Confirmer
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
