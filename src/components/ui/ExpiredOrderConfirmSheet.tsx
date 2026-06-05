import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useConfirmExpiredOrder } from "@/src/hooks/usePurchaseOrders";

interface Props {
  visible: boolean;
  onClose: () => void;
  order: {
    id: string;
    code: string;
    bloodType: string;
    quantity: number;
  } | null;
}

export default function ExpiredOrderConfirmSheet({
  visible,
  onClose,
  order,
}: Props) {
  const colors = useColors();
  const [wasDelivered, setWasDelivered] = useState<boolean | null>(null);
  const [cntsNotes, setCntsNotes] = useState("");

  const { mutateAsync: confirmExpiry, isPending } = useConfirmExpiredOrder();

  const styles = useThemedStyles((c) => ({
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.65)",
      justifyContent: "flex-end",
    },
    card: {
      backgroundColor: c.cardBg,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: 24,
      paddingBottom: 36,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
    },
    // ── Header ──
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 6,
    },
    headerIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.amber + "1A",
    },
    headerTitle: {
      color: c.white,
      fontSize: 17,
      fontWeight: "700",
    },
    headerSub: {
      color: c.textMuted,
      fontSize: 12,
      marginTop: 1,
    },
    divider: {
      height: 0.5,
      backgroundColor: c.cardBorder,
      marginVertical: 18,
    },
    // ── Description ──
    description: {
      color: c.textMuted,
      fontSize: 13,
      lineHeight: 20,
      marginBottom: 16,
    },
    // ── Code badge ──
    codeBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: c.red + "12",
      borderWidth: 0.5,
      borderColor: c.red + "33",
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 10,
      alignSelf: "flex-start",
      marginBottom: 20,
    },
    codeText: {
      color: c.red,
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: 0.8,
    },
    codeSub: {
      color: c.textMuted,
      fontSize: 12,
    },
    // ── Choix ──
    choiceRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 16,
    },
    choiceBtn: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderRadius: 16,
      borderWidth: 0.5,
      gap: 6,
    },
    choiceBtnLabel: {
      fontSize: 13,
      fontWeight: "700",
      textAlign: "center",
    },
    choiceBtnSub: {
      fontSize: 11,
      textAlign: "center",
    },
    // ── Input ──
    input: {
      backgroundColor: c.bg,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      borderRadius: 12,
      padding: 13,
      color: c.white,
      fontSize: 13,
      marginBottom: 18,
      minHeight: 72,
      textAlignVertical: "top",
      lineHeight: 20,
    },
    // ── Submit ──
    submitBtn: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      paddingVertical: 15,
      borderRadius: 16,
      borderWidth: 0.5,
    },
    submitText: {
      fontSize: 15,
      fontWeight: "700",
    },
  }));

  if (!visible || !order) return null;

  const handleConfirm = async (delivered: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await confirmExpiry({
        id: order.id,
        payload: { wasDelivered: delivered, cntsNotes: cntsNotes || undefined },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const isYes = wasDelivered === true;
  const isNo = wasDelivered === false;
  const hasChoice = wasDelivered !== null;

  // Couleurs dynamiques du bouton submit
  const submitBg = !hasChoice
    ? colors.cardBg
    : isYes
      ? colors.success + "14"
      : colors.red + "14";
  const submitBorder = !hasChoice
    ? colors.cardBorder
    : isYes
      ? colors.success + "4D"
      : colors.red + "4D";
  const submitColor = !hasChoice
    ? colors.textMuted
    : isYes
      ? colors.success
      : colors.red;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerIconWrap}>
            <Ionicons name="timer-outline" size={20} color={colors.amber} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Bon expiré</Text>
            <Text style={styles.headerSub}>
              Confirmez l&apos;état de la livraison
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── Description ── */}
        <Text style={styles.description}>
          Ce bon n&apos;a pas été scanné dans les délais. Indiquez si le sang a
          physiquement quitté votre structure afin d&apos;ajuster les stocks.
        </Text>

        {/* ── Code badge ── */}
        <View style={styles.codeBadge}>
          <Ionicons name="qr-code-outline" size={14} color={colors.red} />
          <Text style={styles.codeText}>{order.code}</Text>
          <Text style={styles.codeSub}>
            — {order.quantity} poche{order.quantity > 1 ? "s" : ""}{" "}
            {order.bloodType.replaceAll("_", " ")}
          </Text>
        </View>

        {/* ── Choix Oui / Non ── */}
        <View style={styles.choiceRow}>
          {/* Oui — sang remis */}
          <TouchableOpacity
            style={[
              styles.choiceBtn,
              {
                backgroundColor: isYes ? colors.success + "14" : colors.cardBg,
                borderColor: isYes ? colors.success + "4D" : colors.cardBorder,
                borderWidth: isYes ? 1.5 : 0.5,
              },
            ]}
            onPress={() => setWasDelivered(true)}
            activeOpacity={0.75}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color={isYes ? colors.success : colors.textMuted}
            />
            <Text
              style={[
                styles.choiceBtnLabel,
                { color: isYes ? colors.success : colors.white },
              ]}
            >
              Oui, sang remis
            </Text>
            <Text
              style={[
                styles.choiceBtnSub,
                { color: isYes ? colors.success + "99" : colors.textMuted },
              ]}
            >
              Marquer USED
            </Text>
          </TouchableOpacity>

          {/* Non — restitué */}
          <TouchableOpacity
            style={[
              styles.choiceBtn,
              {
                backgroundColor: isNo ? colors.red + "14" : colors.cardBg,
                borderColor: isNo ? colors.red + "4D" : colors.cardBorder,
                borderWidth: isNo ? 1.5 : 0.5,
              },
            ]}
            onPress={() => setWasDelivered(false)}
            activeOpacity={0.75}
          >
            <Ionicons
              name="arrow-undo-outline"
              size={22}
              color={isNo ? colors.red : colors.textMuted}
            />
            <Text
              style={[
                styles.choiceBtnLabel,
                { color: isNo ? colors.red : colors.white },
              ]}
            >
              Non, restitué
            </Text>
            <Text
              style={[
                styles.choiceBtnSub,
                { color: isNo ? colors.red + "99" : colors.textMuted },
              ]}
            >
              Remettre en stock
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Notes ── */}
        <TextInput
          style={styles.input}
          placeholder="Notes optionnelles (ex : ambulancier venu sans smartphone…)"
          placeholderTextColor={colors.textMuted}
          multiline
          value={cntsNotes}
          onChangeText={setCntsNotes}
        />

        {/* ── Bouton Confirmer ── */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            {
              backgroundColor: submitBg,
              borderColor: submitBorder,
              opacity: !hasChoice || isPending ? 0.5 : 1,
            },
          ]}
          disabled={!hasChoice || isPending}
          onPress={() => wasDelivered !== null && handleConfirm(wasDelivered)}
          activeOpacity={0.8}
        >
          {isPending ? (
            <ActivityIndicator color={submitColor} size="small" />
          ) : (
            <>
              <Ionicons
                name={
                  !hasChoice
                    ? "checkmark-outline"
                    : isYes
                      ? "checkmark-done-outline"
                      : "arrow-undo-outline"
                }
                size={18}
                color={submitColor}
              />
              <Text style={[styles.submitText, { color: submitColor }]}>
                {!hasChoice
                  ? "Confirmer"
                  : isYes
                    ? "Confirmer la remise"
                    : "Restituer le stock"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
