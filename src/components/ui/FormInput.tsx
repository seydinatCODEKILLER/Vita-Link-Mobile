import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ─── Palette sombre Vita-Link ──────────────────────────────────
const COLORS = {
  bg: "#080808",
  red: "#DC1E1E",
  redGlow: "rgba(220,30,30,0.15)",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.45)",
  inputBg: "#141414",
  inputBorder: "rgba(255,255,255,0.10)",
  inputBorderFocused: "#DC1E1E",
  inputBorderError: "#EF4444",
  placeholder: "rgba(255,255,255,0.25)",
  errorText: "#EF4444",
  successGreen: "#22C55E",
} as const;

interface FormInputProps extends TextInputProps {
  label?: string;
  sublabel?: string; // ex: "(optionnel)"
  error?: string;
  isPassword?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  rightElement?: React.ReactNode;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  sublabel,
  error,
  isPassword = false,
  icon,
  rightElement,
  style,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? COLORS.inputBorderError
    : focused
      ? COLORS.inputBorderFocused
      : COLORS.inputBorder;

  const iconColor = error
    ? COLORS.inputBorderError
    : focused
      ? COLORS.red
      : COLORS.textMuted;

  const hasFocusGlow = focused && !error;
  const hasErrorGlow = !!error;

  return (
    <View style={styles.wrapper}>
      {/* ── Label ── */}
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
        </View>
      )}

      {/* ── Input container ── */}
      <View
        style={[
          styles.inputContainer,
          { borderColor },
          hasFocusGlow && styles.focusGlow,
          hasErrorGlow && styles.errorGlow,
        ]}
      >
        {/* Icône gauche */}
        {icon && (
          <View style={styles.iconLeft}>
            <Ionicons name={icon} size={17} color={iconColor} />
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            !icon && styles.inputNoPadding,
            isPassword && styles.inputWithRight,
            style,
          ]}
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          selectionColor={COLORS.red}
          cursorColor={COLORS.red}
          {...props}
        />

        {/* Toggle mot de passe */}
        {isPassword && (
          <TouchableOpacity
            style={styles.iconRight}
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        )}

        {/* Élément droit custom (ex: indicatif pays) */}
        {rightElement && !isPassword && (
          <View style={styles.iconRight}>{rightElement}</View>
        )}
      </View>

      {/* ── Message d'erreur ── */}
      {error && (
        <View style={styles.errorRow}>
          <Ionicons
            name="alert-circle-outline"
            size={13}
            color={COLORS.errorText}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  label: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  sublabel: {
    color: "rgba(255,255,255,0.28)",
    fontSize: 12,
    fontWeight: "400",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  focusGlow: {
    // Légère lueur rouge au focus
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  errorGlow: {
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  iconLeft: {
    paddingLeft: 14,
    paddingRight: 10,
  },
  iconRight: {
    paddingRight: 14,
    paddingLeft: 8,
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
    paddingVertical: 15,
    paddingLeft: 14,
    paddingRight: 14,
  },
  inputNoPadding: {
    paddingLeft: 14,
  },
  inputWithRight: {
    paddingRight: 4,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
    marginLeft: 2,
  },
  errorText: {
    color: COLORS.errorText,
    fontSize: 12,
    flex: 1,
  },
});
