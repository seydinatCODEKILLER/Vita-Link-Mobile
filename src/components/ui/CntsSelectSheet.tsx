import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/src/theme/useTheme";
import { useAvailableCnts } from "@/src/hooks/useHealthStructure";
import { AvailableCnts } from "@/src/types/healthStructure.type";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (cnts: AvailableCnts) => void;
  selectedCntsId?: string;
}

export default function CntsSelectSheet({
  visible,
  onClose,
  onSelect,
  selectedCntsId,
}: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: cntsList, isLoading, isError } = useAvailableCnts();

  const [search, setSearch] = useState("");
  const [pendingCnts, setPendingCnts] = useState<AvailableCnts | null>(null);

  const filtered = useMemo(() => {
    if (!cntsList) return [];
    const q = search.toLowerCase().trim();
    if (!q) return cntsList;
    return cntsList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q),
    );
  }, [cntsList, search]);

  const handleSelect = (cnts: AvailableCnts) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPendingCnts(cnts);
  };

  const handleConfirm = () => {
    if (!pendingCnts) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect(pendingCnts);
    resetAndClose();
  };

  const resetAndClose = useCallback(() => {
    setSearch("");
    setPendingCnts(null);
    Keyboard.dismiss(); // ✅ FIX : Fermer le clavier proprement
    onClose();
  }, [onClose]);

  const renderItem = ({ item }: { item: AvailableCnts }) => {
    // ✅ FIX : On compare le pending local, SINON on tombe sur la valeur du parent
    const isSelected =
      pendingCnts?.id === item.id ||
      (!pendingCnts && selectedCntsId === item.id);

    return (
      <TouchableOpacity
        onPress={() => handleSelect(item)}
        activeOpacity={0.75}
        style={{
          padding: 14,
          borderRadius: 14,
          borderWidth: isSelected ? 1.5 : 1,
          borderColor: isSelected ? colors.red : colors.cardBorder,
          backgroundColor: isSelected
            ? colors.red + "10"
            : colors.cardBg + "80",
          marginBottom: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: isSelected
                ? colors.red + "18"
                : colors.cardBorder + "30",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="water-outline"
              size={18}
              color={isSelected ? colors.red : colors.textSubtle}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "800",
                color: isSelected ? colors.red : colors.white,
              }}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: colors.textSubtle,
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {item.address}
            </Text>
          </View>

          {isSelected && (
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: colors.red,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="checkmark" size={11} color="#fff" />
            </View>
          )}
        </View>

        <View
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: isSelected
              ? colors.red + "20"
              : colors.cardBorder + "40",
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Ionicons
            name="location-outline"
            size={11}
            color={isSelected ? colors.red + "AA" : colors.textMuted}
          />
          <Text
            style={{
              fontSize: 11,
              color: isSelected ? colors.red + "AA" : colors.textMuted,
            }}
          >
            {item.region}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ✅ FIX : Le récapitulatif doit utiliser la valeur "pending" ou la valeur déjà "selected" du parent
  const activeCnts =
    pendingCnts ?? cntsList?.find((c) => c.id === selectedCntsId);

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
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={resetAndClose}
            activeOpacity={1}
          />

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
              maxHeight: "80%",
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
                    Sélectionner un CNTS
                  </Text>
                  <Text
                    style={{
                      color: colors.textSubtle,
                      fontSize: 12,
                      marginTop: 3,
                    }}
                  >
                    Centre National de Transfusion Sanguine rattaché
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

            {/* ── Search ── */}
            <View style={{ paddingHorizontal: 22, paddingTop: 14 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.cardBorder + "18",
                  borderWidth: 1,
                  borderColor: colors.cardBorder,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  gap: 8,
                }}
              >
                <Ionicons
                  name="search-outline"
                  size={16}
                  color={colors.textSubtle}
                />
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    color: colors.white,
                    fontSize: 13,
                  }}
                  placeholder="Rechercher par nom ou région..."
                  placeholderTextColor={colors.textSubtle}
                  value={search}
                  onChangeText={setSearch}
                  returnKeyType="done" // ✅ OPTIM : Change le bouton du clavier
                  onSubmitEditing={Keyboard.dismiss} // ✅ OPTIM : Ferme le clavier sur "Entrée"
                />
              </View>
            </View>

            {/* ── List ── */}
            {isLoading ? (
              <View style={{ padding: 32, alignItems: "center" }}>
                <ActivityIndicator color={colors.red} />
                <Text
                  style={{
                    color: colors.textSubtle,
                    fontSize: 12,
                    marginTop: 10,
                  }}
                >
                  Chargement des CNTS...
                </Text>
              </View>
            ) : isError ? (
              <View style={{ padding: 32, alignItems: "center" }}>
                <Ionicons
                  name="alert-circle-outline"
                  size={28}
                  color={colors.red}
                />
                <Text
                  style={{
                    color: colors.textSubtle,
                    fontSize: 12,
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  Impossible de charger les CNTS.{"\n"}Vérifiez votre connexion.
                </Text>
              </View>
            ) : filtered.length === 0 ? (
              <View style={{ padding: 32, alignItems: "center" }}>
                <Ionicons
                  name="search-outline"
                  size={28}
                  color={colors.textMuted}
                />
                <Text
                  style={{
                    color: colors.textSubtle,
                    fontSize: 12,
                    marginTop: 8,
                  }}
                >
                  Aucun CNTS trouvé pour « {search} »
                </Text>
              </View>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 22, paddingTop: 12 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              />
            )}

            {/* ── Selected recap + Confirm ── */}
            {activeCnts && (
              <View style={{ paddingHorizontal: 22, paddingTop: 4 }}>
                <View
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: colors.red + "08",
                    borderWidth: 1,
                    borderColor: colors.red + "18",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color={colors.red}
                  />
                  <View>
                    <Text style={{ color: colors.textSubtle, fontSize: 11 }}>
                      CNTS sélectionné
                    </Text>
                    <Text
                      style={{
                        color: colors.white,
                        fontSize: 13,
                        fontWeight: "700",
                        marginTop: 1,
                      }}
                    >
                      {activeCnts.name} · {activeCnts.region}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    paddingVertical: 14,
                    borderRadius: 14,
                    backgroundColor: colors.red,
                  }}
                >
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text
                    style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}
                  >
                    Confirmer la sélection
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
