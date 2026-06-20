import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";

import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { STATUS_CONFIG } from "@/src/constants/purchaseOrderConfig";
import { PurchaseOrder } from "@/src/types/blood-request.types";

dayjs.extend(relativeTime);
dayjs.locale("fr");

interface PurchaseOrderCardProps {
  order: PurchaseOrder;
  onConfirmExpired: (order: PurchaseOrder) => void;
}

export function PurchaseOrderCard({
  order,
  onConfirmExpired,
}: PurchaseOrderCardProps) {
  const colors = useColors();

  const styles = useThemedStyles((c) => ({
    card: {
      marginHorizontal: 20,
      marginBottom: 10,
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 16,
      overflow: "hidden",
    },
    cardAccent: {
      position: "absolute",
      top: 0,
      left: 0,
      width: 3,
      height: "100%",
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
    },
    cardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    cardLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    bloodBadge: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: c.red + "14",
      borderWidth: 1,
      borderColor: c.red + "30",
      alignItems: "center",
      justifyContent: "center",
    },
    bloodBadgeText: { color: c.red, fontSize: 15, fontWeight: "900" },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 8,
      borderWidth: 0.5,
    },
    statusText: { fontSize: 10, fontWeight: "700" },
    divider: { height: 0.5, backgroundColor: c.cardBorder, marginBottom: 12 },
    cardBody: { gap: 7 },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    infoIconWrap: {
      width: 24,
      height: 24,
      borderRadius: 7,
      backgroundColor: c.cardBorder + "80",
      alignItems: "center",
      justifyContent: "center",
    },
    infoText: { color: c.textMuted, fontSize: 12, fontWeight: "500", flex: 1 },
    infoTextBold: { color: c.white, fontSize: 12, fontWeight: "700" },
    confirmBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginTop: 12,
      paddingVertical: 11,
      borderRadius: 11,
      backgroundColor: c.red + "14",
      borderWidth: 1,
      borderColor: c.red + "30",
    },
    confirmBtnText: { color: c.red, fontSize: 12, fontWeight: "700" },
  }));

  // La carte gère sa propre config de statut !
  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const statusColor = (colors as any)[statusCfg.color] ?? colors.textMuted;

  return (
    <View style={styles.card}>
      <View style={[styles.cardAccent, { backgroundColor: statusColor }]} />

      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <View style={styles.bloodBadge}>
            <Text style={styles.bloodBadgeText}>
              {order.bloodType.replace("_", "")}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusColor + "14",
              borderColor: statusColor + "38",
            },
          ]}
        >
          <Ionicons name={statusCfg.icon} size={10} color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusCfg.label}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <View style={styles.infoIconWrap}>
            <Ionicons
              name="business-outline"
              size={12}
              color={colors.textMuted}
            />
          </View>
          <Text style={styles.infoText} numberOfLines={1}>
            {order.hospital.name}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconWrap}>
            <Ionicons name="water-outline" size={12} color={colors.textMuted} />
          </View>
          <Text style={styles.infoText}>
            <Text style={styles.infoTextBold}>{order.quantity}</Text> poche(s) —{" "}
            {order.bloodType.replace("_", " ")}
          </Text>
        </View>

        {order.expiresAt && (
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons
                name="hourglass-outline"
                size={12}
                color={colors.textMuted}
              />
            </View>
            <Text style={styles.infoText}>
              Expire {dayjs(order.expiresAt).fromNow()}
            </Text>
          </View>
        )}
      </View>

      {order.status === "EXPIRED" && (
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={() => onConfirmExpired(order)}
          activeOpacity={0.7}
        >
          <Ionicons name="help-circle-outline" size={14} color={colors.red} />
          <Text style={styles.confirmBtnText}>Le sang a-t-il été remis ?</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
