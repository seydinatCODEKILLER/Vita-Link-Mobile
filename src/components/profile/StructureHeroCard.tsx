import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { getStatusConfig } from "@/src/constants/structureStatus";

interface StructureHeroCardProps {
  isLoading: boolean;
  structure?: {
    name?: string | null;
    address?: string | null;
    status?: string | null;
  } | null;
}

export function StructureHeroCard({
  isLoading,
  structure,
}: StructureHeroCardProps) {
  const colors = useColors();
  const STATUS_CONFIG = getStatusConfig(colors);

  const styles = useThemedStyles((c) => ({
    heroCard: {
      backgroundColor: c.cardBg,
      borderRadius: 22,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 18,
      marginBottom: 20,
      overflow: "hidden",
    },
    loadingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: 20,
    },
    loadingText: { color: c.textMuted, fontSize: 13, fontWeight: "500" },
    heroTop: { flexDirection: "row", alignItems: "center", gap: 14 },
    heroInfo: { flex: 1, gap: 5 },
    structureName: {
      color: c.white,
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: -0.3,
    },
    structureAddress: { color: c.textMuted, fontSize: 12, fontWeight: "500" },
    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 0.5,
      alignSelf: "flex-start",
      marginTop: 3,
    },
    statusText: { fontSize: 11, fontWeight: "700" },
    fixedDataBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: c.cardBorder,
      borderRadius: 10,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 10,
      marginTop: 10,
    },
    fixedDataText: {
      flex: 1,
      color: c.textMuted,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: "500",
    },
  }));

  if (isLoading) {
    return (
      <View style={styles.heroCard}>
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.red} size="small" />
          <Text style={styles.loadingText}>Chargement des données...</Text>
        </View>
      </View>
    );
  }

  const statusConfig = structure?.status
    ? STATUS_CONFIG[structure.status]
    : STATUS_CONFIG.PENDING_REVIEW;

  return (
    <View style={styles.heroCard}>
      <View style={styles.heroTop}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
            flexShrink: 0,
            backgroundColor: colors.red + "14",
            borderColor: colors.red + "30",
          }}
        >
          <Ionicons name="medkit-outline" size={28} color={colors.red} />
        </View>
        <View style={styles.heroInfo}>
          <Text style={styles.structureName} numberOfLines={2}>
            {structure?.name ?? "Centre National de Transfusion"}
          </Text>
          {structure?.address && (
            <Text style={styles.structureAddress} numberOfLines={1}>
              {structure.address}
            </Text>
          )}
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: statusConfig.color + "14",
                borderColor: statusConfig.color + "30",
              },
            ]}
          >
            <Ionicons
              name={statusConfig.icon}
              size={11}
              color={statusConfig.color}
            />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.fixedDataBanner}>
        <Ionicons
          name="lock-closed-outline"
          size={14}
          color={colors.textMuted}
        />
        <Text style={styles.fixedDataText}>
          Les informations de la structure sont fixes. Pour toute modification,
          contactez l&apos;administration Vita-Link.
        </Text>
      </View>
    </View>
  );
}
