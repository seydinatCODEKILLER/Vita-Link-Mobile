import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Controller } from "react-hook-form";

import { useSmartBack } from "@/src/hooks/useSmartBack";
import { FormInput } from "@/src/components/ui/FormInput";
import { useColors } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";

import { BloodTypeGrid } from "@/src/components/alerts/create/BloodTypeGrid";
import { UrgencySelector } from "@/src/components/alerts/create/UrgencySelector";
import { ServicePills } from "@/src/components/alerts/create/ServicePills";
import { RadiusSlider } from "@/src/components/alerts/create/RadiusSlider";
import { ExpirationInfoCard } from "@/src/components/alerts/create/ExpirationInfoCard";
import { useCreateAlertForm } from "@/src/hooks/useCreateAlertForm";
import { useCreateAlertStyles } from "@/src/hooks/useCreateAlertStyles";

export default function CreateAlertScreen() {
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);
  const tabBarHeight = useBottomTabBarHeight();
  const styles = useCreateAlertStyles();

  const {
    control,
    fadeAnim,
    radiusKm,
    setValue,
    isValid,
    isPending,
    handleSubmit,
  } = useCreateAlertForm();

  const goBack = useSmartBack({
    defaultRoute: "/(health)/alerts",
    routeMap: {
      alerts: "/(health)/alerts",
      dashboard: "/(health)",
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <View style={styles.haloTop} />

      <SafeAreaView style={styles.safeArea}>
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity
            onPress={goBack}
            style={styles.backBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="close" size={20} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouvelle Alerte</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 80 + tabBarHeight + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, gap: 24 }}>
            {/* ── Groupe Sanguin ──────────────────────────────────────────── */}
            <View style={{ gap: 10 }}>
              <Text style={styles.fieldLabel}>Groupe sanguin requis *</Text>
              <Controller
                control={control}
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
            </View>

            {/* ── Urgence ─────────────────────────────────────────────────── */}
            <View style={{ gap: 10 }}>
              <Text style={styles.fieldLabel}>Niveau d&apos;urgence *</Text>
              <Controller
                control={control}
                name="urgencyLevel"
                render={({ field, fieldState }) => (
                  <UrgencySelector
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    colors={colors}
                  />
                )}
              />
            </View>

            {/* ── Quantité ────────────────────────────────────────────────── */}
            <View style={{ gap: 10 }}>
              <Controller
                control={control}
                name="quantityNeeded"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Nombre de donneurs requis *"
                    icon="people-outline"
                    placeholder="Ex: 3"
                    value={String(field.value)}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                    keyboardType="number-pad"
                    returnKeyType="done"
                  />
                )}
              />
            </View>

            {/* ── Service ─────────────────────────────────────────────────── */}
            <View style={{ gap: 10 }}>
              <Text style={styles.fieldLabel}>Service médical</Text>
              <Controller
                control={control}
                name="serviceUnit"
                render={({ field }) => (
                  <ServicePills
                    value={field.value}
                    onChange={field.onChange}
                    colors={colors}
                  />
                )}
              />
            </View>

            {/* ── Info Expiration ─────────────────────────────────────────── */}
            <ExpirationInfoCard />

            {/* ── Rayon ───────────────────────────────────────────────────── */}
            <RadiusSlider
              value={radiusKm}
              onChange={(val) => setValue("radiusKm", val)}
            />
          </Animated.View>
        </ScrollView>

        {/* ── Footer CTA ──────────────────────────────────────────────────── */}
        <View style={[styles.footer, { paddingBottom: tabBarHeight + 20 }]}>
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.85}
            style={[
              styles.ctaBtn,
              (!isValid || isPending) && styles.ctaBtnDisabled,
            ]}
            disabled={!isValid || isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={!isValid ? "rgba(255,255,255,0.5)" : "#FFFFFF"}
                />
                <Text
                  style={[
                    styles.ctaBtnText,
                    !isValid && styles.ctaBtnTextDisabled,
                  ]}
                >
                  Lancer l&apos;alerte
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
