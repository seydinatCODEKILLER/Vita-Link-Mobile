import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";

interface FormInputProps extends TextInputProps {
  label?: string;
  sublabel?: string;
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
  const colors = useColors();
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const styles = useThemedStyles((c) => ({
    wrapper: { marginBottom: 16 },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 8,
    },
    label: {
      color: c.white,
      fontSize: 13,
      fontWeight: "600",
      letterSpacing: 0.3,
      opacity: 0.75,
    },
    sublabel: {
      color: c.textSubtle,
      fontSize: 12,
      fontWeight: "400",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.inputBg,
      borderRadius: 14,
      borderWidth: 1.5,
      overflow: "hidden",
      borderColor: error ? "#EF4444" : focused ? c.red : c.cardBorder,
    },
    focusGlow: {
      shadowColor: c.red,
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
    iconLeft: { paddingLeft: 14, paddingRight: 10 },
    iconRight: { paddingRight: 14, paddingLeft: 8 },
    input: {
      flex: 1,
      color: c.white,
      fontSize: 15,
      paddingVertical: 15,
      paddingLeft: 14,
      paddingRight: 14,
    },
    inputNoPadding: { paddingLeft: 14 },
    inputWithRight: { paddingRight: 4 },
    errorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 6,
      marginLeft: 2,
    },
    errorText: { color: "#EF4444", fontSize: 12, flex: 1 },
  }));

  const borderColor = error
    ? "#EF4444"
    : focused
      ? colors.red
      : colors.cardBorder;

  const iconColor = error ? "#EF4444" : focused ? colors.red : colors.textMuted;
  const hasFocusGlow = focused && !error;
  const hasErrorGlow = !!error;

  return (
    <View style={styles.wrapper}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          { borderColor }, // Géré dynamiquement selon le state
          hasFocusGlow && styles.focusGlow,
          hasErrorGlow && styles.errorGlow,
        ]}
      >
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
          placeholderTextColor={colors.textSubtle}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          selectionColor={colors.red}
          cursorColor={colors.red}
          {...props}
        />

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
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}

        {rightElement && !isPassword && (
          <View style={styles.iconRight}>{rightElement}</View>
        )}
      </View>

      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={13} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};
