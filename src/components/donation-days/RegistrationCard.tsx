import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { DayRegistration } from "@/src/types/donation-day.types";
import { REGISTRATION_STATUS_CONFIG } from "@/src/constants/dayDetailConfig";
import { isEventToday } from "@/src/utils/format.utils";

dayjs.locale("fr");

interface RegistrationCardProps {
  item: DayRegistration;
  scheduledDate: string;
  onMark: (registrationId: string, status: "ATTENDED" | "NO_SHOW") => void;
}

export function RegistrationCard({
  item,
  scheduledDate,
  onMark,
}: RegistrationCardProps) {
  const colors = useColors();
  const statusConf =
    REGISTRATION_STATUS_CONFIG[item.status] ??
    REGISTRATION_STATUS_CONFIG.REGISTERED;
  const initials = `${item.donor.firstName[0]}${item.donor.lastName[0]}`;
  const canAct = isEventToday(scheduledDate);
  const eventDateFormatted = dayjs(scheduledDate).format("DD MMMM YYYY");
  const showActions = item.status === "REGISTERED";

  // ← Mapping propre des couleurs du thème au lieu de #10B981 ou #EF4444
  const successColor = colors.success;
  const dangerColor = colors.red;

  const styles = useThemedStyles((c) => ({
    card: {
      backgroundColor: c.cardBg,
      borderRadius: 14,
      padding: 14,
      marginHorizontal: 16,
      marginBottom: 8,
      borderWidth: 0.5,
      borderColor: c.cardBorder + "20",
    },
    cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: statusConf.color + "15",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    avatarText: { color: statusConf.color, fontSize: 13, fontWeight: "500" },
    info: { flex: 1, gap: 4, minWidth: 0 },
    name: { color: c.white, fontSize: 13, fontWeight: "500" },
    meta: { flexDirection: "row", alignItems: "center", gap: 6 },
    bloodType: { color: statusConf.color, fontSize: 11, fontWeight: "600" },
    phone: { color: c.textMuted, fontSize: 11 },
    metaDivider: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: c.textMuted + "30",
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: statusConf.color + "12",
      flexShrink: 0,
    },
    statusDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: statusConf.color,
    },
    statusText: { color: statusConf.color, fontSize: 10, fontWeight: "600" },
    divider: {
      height: 0.5,
      backgroundColor: c.cardBorder + "25",
      marginVertical: 12,
    },
    actionsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: 9,
    },
    actionBtnText: { fontSize: 11, fontWeight: "600" },
    lockedHint: { flexDirection: "row", alignItems: "center", gap: 6 },
    lockedText: { color: c.textMuted + "80", fontSize: 11 },
    lockedDate: { color: c.textMuted, fontWeight: "600", fontSize: 11 },
    todayBadge: {
      marginLeft: "auto",
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 7,
      borderWidth: 0.5,
      // ← Utilisation du thème
      backgroundColor: successColor + "10",
      borderColor: successColor + "25",
    },
    todayBadgeText: { color: successColor, fontSize: 10, fontWeight: "600" },
  }));

  return (
    <View style={styles.card}>
      {/* Ligne principale */}
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.donor.firstName} {item.donor.lastName}
          </Text>
          <View style={styles.meta}>
            <Text style={styles.bloodType}>
              {item.donor.bloodType?.replace("_POS", "+").replace("_NEG", "-")}
            </Text>
            <View style={styles.metaDivider} />
            <Text style={styles.phone}>{item.donor.phone}</Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{statusConf.label}</Text>
        </View>
      </View>

      {/* Séparateur + Zone d'actions */}
      {showActions && (
        <>
          <View style={styles.divider} />
          <View style={styles.actionsRow}>
            {canAct ? (
              <>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: successColor + "12" },
                  ]}
                  onPress={() => onMark(item.id, "ATTENDED")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark" size={14} color={successColor} />
                  <Text style={[styles.actionBtnText, { color: successColor }]}>
                    Présent
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: dangerColor + "12" },
                  ]}
                  onPress={() => onMark(item.id, "NO_SHOW")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={14} color={dangerColor} />
                  <Text style={[styles.actionBtnText, { color: dangerColor }]}>
                    Absent
                  </Text>
                </TouchableOpacity>
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>Aujourd&apos;hui</Text>
                </View>
              </>
            ) : (
              <View style={styles.lockedHint}>
                <Ionicons
                  name="lock-closed-outline"
                  size={13}
                  color={colors.textMuted + "80"}
                />
                <Text style={styles.lockedText}>
                  Actions disponibles le{" "}
                  <Text style={styles.lockedDate}>{eventDateFormatted}</Text>
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}
