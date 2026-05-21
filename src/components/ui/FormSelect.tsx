import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  bg: "#080808",
  red: "#DC1E1E",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.45)",
  inputBg: "#141414",
  inputBorder: "rgba(255,255,255,0.10)",
  inputBorderFocused: "#DC1E1E",
  inputBorderError: "#EF4444",
  placeholder: "rgba(255,255,255,0.25)",
  errorText: "#EF4444",
  modalBg: "rgba(0,0,0,0.85)",
} as const;

interface FormSelectProps {
  label?: string;
  sublabel?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  placeholder?: string;
  value: string | undefined;
  options: readonly string[];
  onSelect: (value: string) => void;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  sublabel,
  error,
  icon,
  placeholder = "Sélectionner...",
  value,
  options,
  onSelect,
}) => {
  const [visible, setVisible] = useState(false);

  const borderColor = error
    ? COLORS.inputBorderError
    : visible
      ? COLORS.inputBorderFocused
      : COLORS.inputBorder;

  const iconColor = error
    ? COLORS.inputBorderError
    : visible
      ? COLORS.red
      : COLORS.textMuted;

  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 13,
              fontWeight: "600",
            }}
          >
            {label}
          </Text>
          {sublabel && (
            <Text style={{ color: "rgba(255,255,255,0.28)", fontSize: 12 }}>
              {sublabel}
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: COLORS.inputBg,
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor,
          paddingVertical: 15,
          paddingLeft: icon ? 10 : 14,
          paddingRight: 14,
        }}
      >
        {icon && (
          <View style={{ paddingRight: 10 }}>
            <Ionicons name={icon} size={17} color={iconColor} />
          </View>
        )}
        <Text
          style={{
            flex: 1,
            fontSize: 15,
            color: value ? COLORS.white : COLORS.placeholder,
          }}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <Ionicons
          name="chevron-down-outline"
          size={18}
          color={COLORS.textMuted}
        />
      </TouchableOpacity>

      {error && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            marginTop: 6,
            marginLeft: 2,
          }}
        >
          <Ionicons
            name="alert-circle-outline"
            size={13}
            color={COLORS.errorText}
          />
          <Text style={{ color: COLORS.errorText, fontSize: 12 }}>{error}</Text>
        </View>
      )}

      {/* Modal Select */}
      <Modal visible={visible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Sélectionner une région</Text>

                <FlatList
                  data={options as string[]}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => {
                    const isSelected = item === value;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.optionItem,
                          isSelected && styles.optionSelected,
                        ]}
                        onPress={() => {
                          onSelect(item);
                          setVisible(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                          ]}
                        >
                          {item}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={COLORS.red}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  modalContent: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  optionSelected: {
    backgroundColor: "rgba(220,30,30,0.10)",
  },
  optionText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
    fontWeight: "500",
  },
  optionTextSelected: {
    color: COLORS.white,
    fontWeight: "700",
  },
});
