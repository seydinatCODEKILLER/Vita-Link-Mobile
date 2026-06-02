import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BloodRequest, HandleAction } from "@/src/types/blood-request.types";
import { useHandleBloodRequest } from "@/src/hooks/useBloodRequests";
import { useColors } from "@/src/theme/useTheme";

const ACTIONS_CONFIG = [
  {
    value: "FULFILL" as HandleAction,
    label: "Fournir tout",
    icon: "checkmark-circle-outline" as const,
    color: "#10B981",
  },
  {
    value: "PARTIALLY_FULFILL" as HandleAction,
    label: "En partie",
    icon: "pie-chart-outline" as const,
    color: "#60A5FA",
  },
  {
    value: "ESCALATE" as HandleAction,
    label: "Escalader",
    icon: "alert-circle-outline" as const,
    color: "#F59E0B",
  },
  {
    value: "REJECT" as HandleAction,
    label: "Rejeter",
    icon: "close-circle-outline" as const,
    color: "#EF4444",
  },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  requestId: string;
  request: BloodRequest;
}

export default function BloodRequestHandleSheet({
  visible,
  onClose,
  requestId,
  request,
}: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { mutateAsync: handleRequest, isPending } = useHandleBloodRequest();

  const [selectedAction, setSelectedAction] = useState<HandleAction | null>(
    null,
  );
  const [quantityProvided, setQuantityProvided] = useState("");
  const [cntsNotes, setCntsNotes] = useState("");

  const selectedConfig = ACTIONS_CONFIG.find((a) => a.value === selectedAction);

  const handleConfirm = async () => {
    if (!selectedAction) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (
      selectedAction === "PARTIALLY_FULFILL" &&
      (!quantityProvided || parseInt(quantityProvided) <= 0)
    ) {
      Alert.alert("Erreur", "Veuillez saisir la quantité fournie.");
      return;
    }

    try {
      await handleRequest({
        id: requestId,
        payload: {
          action: selectedAction,
          quantityProvided:
            selectedAction === "PARTIALLY_FULFILL"
              ? parseInt(quantityProvided)
              : undefined,
          cntsNotes: cntsNotes || undefined,
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } catch (error: any) {
      Alert.alert(
        "Erreur",
        error?.response?.data?.message || "Échec du traitement",
      );
    }
  };

  const resetAndClose = () => {
    setSelectedAction(null);
    setQuantityProvided("");
    setCntsNotes("");
    onClose();
  };

  const confirmColor = selectedConfig?.color ?? colors.success;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={resetAndClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          }}
        >
          {/* Dismiss overlay */}
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={resetAndClose}
            activeOpacity={1}
          />

          {/* Sheet */}
          <View
            style={{
              backgroundColor: colors.cardBg,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTopWidth: 1,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderColor: colors.cardBorder,
              paddingBottom: Math.max(28, insets.bottom + 12),
            }}
          >
            {/* ── Header ── */}
            <View
              style={{
                padding: 22,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.cardBorder,
              }}
            >
              {/* Handle */}
              <View
                style={{
                  width: 32,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.cardBorder,
                  alignSelf: "center",
                  marginBottom: 16,
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <View>
                  <Text
                    style={{
                      color: colors.white,
                      fontSize: 18,
                      fontWeight: "800",
                      letterSpacing: -0.3,
                    }}
                  >
                    Traiter la demande
                  </Text>
                  <Text
                    style={{
                      color: colors.textSubtle,
                      fontSize: 12,
                      marginTop: 3,
                    }}
                  >
                    {request.requestingHospital.name}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={resetAndClose}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    backgroundColor: colors.cardBorder + "40",
                    borderWidth: 1,
                    borderColor: colors.cardBorder,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="close" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Context pill ── */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginHorizontal: 22,
                marginTop: 14,
                padding: 12,
                borderRadius: 12,
                backgroundColor: colors.red + "08",
                borderWidth: 1,
                borderColor: colors.red + "18",
              }}
            >
              <Text
                style={{
                  color: colors.red,
                  fontSize: 20,
                  fontWeight: "900",
                  letterSpacing: -1,
                }}
              >
                {request.bloodType.replace("_", "")}
              </Text>
              <View
                style={{
                  width: 1,
                  height: 18,
                  backgroundColor: colors.cardBorder,
                }}
              />
              <Text style={{ color: colors.textSubtle, fontSize: 12 }}>
                <Text style={{ color: colors.white, fontWeight: "700" }}>
                  {request.quantityNeeded} poches
                </Text>
                {" demandées · "}
                <Text style={{ color: colors.white, fontWeight: "700" }}>
                  {request.quantityProvided ?? 0}
                </Text>
                {" fournies"}
              </Text>
            </View>

            {/* ── Actions grid ── */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                paddingHorizontal: 22,
                marginTop: 14,
              }}
            >
              {ACTIONS_CONFIG.map((action) => {
                const isSelected = selectedAction === action.value;
                return (
                  <TouchableOpacity
                    key={action.value}
                    onPress={() => {
                      setSelectedAction(action.value);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    activeOpacity={0.75}
                    style={{
                      width: "47.5%",
                      alignItems: "center",
                      gap: 6,
                      paddingVertical: 13,
                      paddingHorizontal: 8,
                      borderRadius: 14,
                      borderWidth: isSelected ? 1.5 : 1,
                      borderColor: isSelected
                        ? action.color
                        : colors.cardBorder,
                      backgroundColor: isSelected
                        ? action.color + "12"
                        : colors.cardBg + "80",
                    }}
                  >
                    <Ionicons
                      name={action.icon}
                      size={22}
                      color={isSelected ? action.color : colors.textSubtle}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: isSelected ? action.color : colors.textSubtle,
                      }}
                    >
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Partial qty input ── */}
            {selectedAction === "PARTIALLY_FULFILL" && (
              <View style={{ paddingHorizontal: 22, marginTop: 14, gap: 8 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: colors.textSubtle,
                    textTransform: "uppercase",
                    letterSpacing: 0.7,
                  }}
                >
                  Quantité fournie (sur {request.quantityNeeded})
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#60A5FA" + "0A",
                    borderWidth: 1,
                    borderColor: "#60A5FA" + "40",
                    borderRadius: 12,
                    padding: 13,
                    color: colors.white,
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                  keyboardType="number-pad"
                  placeholder="Ex : 2"
                  placeholderTextColor={colors.textSubtle}
                  value={quantityProvided}
                  onChangeText={setQuantityProvided}
                />
              </View>
            )}

            {/* ── Notes input ── */}
            <View style={{ paddingHorizontal: 22, marginTop: 14, gap: 8 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: colors.textSubtle,
                  textTransform: "uppercase",
                  letterSpacing: 0.7,
                }}
              >
                Notes CNTS (optionnel)
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.cardBorder + "18",
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                  borderRadius: 12,
                  padding: 13,
                  color: colors.white,
                  fontSize: 13,
                  minHeight: 70,
                  textAlignVertical: "top",
                }}
                multiline
                placeholder="Contexte, raison du refus, détails..."
                placeholderTextColor={colors.textSubtle}
                value={cntsNotes}
                onChangeText={setCntsNotes}
              />
            </View>

            {/* ── Confirm button ── */}
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={!selectedAction || isPending}
              activeOpacity={0.8}
              style={{
                marginHorizontal: 22,
                marginTop: 18,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                paddingVertical: 14,
                borderRadius: 14,
                backgroundColor: selectedAction
                  ? confirmColor
                  : colors.cardBorder,
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "800",
                      fontSize: 14,
                    }}
                  >
                    Confirmer l&apos;action
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
