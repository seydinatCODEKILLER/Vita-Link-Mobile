import React from "react";
import { View, Text } from "react-native";
import { useColors } from "@/src/theme/useTheme";
import { useAlertDetailStyles } from "@/src/hooks/useAlertDetailStyles";
import { pluralize } from "@/src/utils/format.utils";

interface AlertProgressCardProps {
  quantityConfirmed: number;
  quantityNeeded: number;
  progressPct: number;
}

export function AlertProgressCard({
  quantityConfirmed,
  quantityNeeded,
  progressPct,
}: AlertProgressCardProps) {
  const colors = useColors();
  const styles = useAlertDetailStyles();

  const missing = quantityNeeded - quantityConfirmed;
  const isComplete = progressPct >= 100;

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHead}>
        <Text style={styles.progressLabel}>Donneurs confirmés</Text>
        <Text
          style={[
            styles.progressCount,
            { color: isComplete ? colors.success : colors.white },
          ]}
        >
          {quantityConfirmed} / {quantityNeeded}
        </Text>
      </View>

      <View style={styles.progressBg}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progressPct}%` as any,
              backgroundColor: isComplete ? colors.success : colors.red,
            },
          ]}
        />
      </View>

      <Text style={styles.progressSub}>
        {isComplete
          ? "Quota atteint ✓"
          : `${missing} ${pluralize(missing, "donneur")} manquant${missing > 1 ? "s" : ""}`}
      </Text>
    </View>
  );
}
