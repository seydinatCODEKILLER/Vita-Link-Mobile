import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView, // ← ajouter
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useVerifyOtp, useResendOtp } from "@/src/hooks/useAuth";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";
import { AppColors } from "@/src/theme/colors";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 120;
const OTP_EXPIRY = 600;

// ─── Masquage email ────────────────────────────────────────────
function maskEmail(email: string): string {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 3);
  return `${visible}***@${domain}`;
}

// ─── Formatage timer mm:ss ─────────────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Composant OTP Input ───────────────────────────────────────
interface OtpInputProps {
  code: string[];
  onCodeChange: (code: string[]) => void;
  hasError: boolean;
  shakeAnim: Animated.Value;
  colors: AppColors;
}

function OtpInput({
  code,
  onCodeChange,
  hasError,
  shakeAnim,
  colors,
}: OtpInputProps) {
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const styles = useThemedStyles((c) => ({
    otpRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 20,
    },
    otpCellWrapper: {
      alignItems: "center",
      gap: 6,
    },
    otpCell: {
      width: 46,
      height: 58,
      backgroundColor: c.inputBg,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: c.cardBorder,
      color: c.white,
      fontSize: 24,
      fontWeight: "800",
      textAlign: "center",
    },
    otpCellActive: {
      borderColor: "rgba(220,30,30,0.45)",
      borderWidth: 2,
    },
    otpCursor: {
      width: 18,
      height: 3,
      borderRadius: 2,
      backgroundColor: c.red,
    },
  }));

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      const digits = text.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
      const newCode = Array(OTP_LENGTH).fill("");
      digits.forEach((d, i) => (newCode[i] = d));
      onCodeChange(newCode);
      const nextIndex = Math.min(digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = text.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    onCodeChange(newCode);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace") {
      const newCode = [...code];
      if (newCode[index]) {
        newCode[index] = "";
        onCodeChange(newCode);
      } else if (index > 0) {
        newCode[index - 1] = "";
        onCodeChange(newCode);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const activeBorderColor = hasError ? "#EF4444" : colors.red;

  return (
    <Animated.View
      style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}
    >
      {Array.from({ length: OTP_LENGTH }).map((_, i) => {
        const isFilled = !!code[i];
        const isActive = code.filter(Boolean).length === i;

        return (
          <View key={i} style={styles.otpCellWrapper}>
            <TextInput
              ref={(ref) => {
                inputRefs.current[i] = ref;
              }}
              style={[
                styles.otpCell,
                isFilled && {
                  borderColor: hasError ? "#EF4444" : activeBorderColor,
                  borderWidth: 2,
                  ...(hasError
                    ? {}
                    : {
                        shadowColor: colors.red,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 4,
                      }),
                },
                isActive && !isFilled && styles.otpCellActive,
              ]}
              value={code[i]}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, i)
              }
              keyboardType="numeric"
              maxLength={OTP_LENGTH}
              textAlign="center"
              selectTextOnFocus
              caretHidden
              selectionColor={colors.red}
            />
            {isActive && !isFilled && <View style={styles.otpCursor} />}
          </View>
        );
      })}
    </Animated.View>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function OtpVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    email: string;
  }>();

  const { mutateAsync: verifyOtp, isPending } = useVerifyOtp();
  const { mutateAsync: resendOtp, isPending: isResending } = useResendOtp();

  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);

  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [hasError, setHasError] = useState(false);
  const [expiryTimer, setExpiryTimer] = useState(OTP_EXPIRY);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    safeArea: { flex: 1, paddingHorizontal: 24 },
    haloCenter: {
      position: "absolute",
      top: -80,
      left: "50%",
      marginLeft: -120,
      width: 240,
      height: 240,
      borderRadius: 120,
      backgroundColor: c.redGlow,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
      marginBottom: 32,
    },
    body: {
      flex: 1,
      alignItems: "center",
    },
    iconWrap: {
      position: "relative",
      marginBottom: 24,
    },
    iconOuter: {
      width: 80,
      height: 80,
      borderRadius: 24,
      backgroundColor: "rgba(220,30,30,0.10)",
      borderWidth: 1,
      borderColor: "rgba(220,30,30,0.22)",
      alignItems: "center",
      justifyContent: "center",
    },
    iconInner: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: "rgba(220,30,30,0.14)",
      alignItems: "center",
      justifyContent: "center",
    },
    iconBadge: {
      position: "absolute",
      bottom: -4,
      right: -4,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: c.success,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: c.bg,
    },
    textBlock: {
      alignItems: "center",
      gap: 8,
      marginBottom: 32,
    },
    title: {
      color: c.white,
      fontSize: 26,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    subtitle: {
      color: c.textMuted,
      fontSize: 14,
      textAlign: "center",
      lineHeight: 22,
    },
    emailHighlight: {
      color: c.white,
      fontWeight: "600",
    },
    errorCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "rgba(239,68,68,0.09)",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "rgba(239,68,68,0.20)",
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 16,
      alignSelf: "stretch",
    },
    errorText: {
      color: "#EF4444",
      fontSize: 13,
      flex: 1,
      lineHeight: 18,
    },
    timerBlock: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    timerCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
    },
    timerText: {
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: 1.5,
    },
    timerLabel: {
      color: c.textMuted,
      fontSize: 13,
    },
    expiredCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "rgba(239,68,68,0.09)",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "rgba(239,68,68,0.20)",
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    expiredText: {
      color: "#EF4444",
      fontSize: 13,
      fontWeight: "500",
    },
    footer: {
      paddingBottom: 10,
      gap: 14,
    },
    ctaBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: c.red,
      borderRadius: 16,
      paddingVertical: 17,
    },
    ctaBtnDisabled: { opacity: 0.45 },
    ctaBtnText: {
      color: c.white,
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.2,
    },
    ctaBtnIcon: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center",
    },
    resendRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 4,
    },
    resendText: {
      color: c.textMuted,
      fontSize: 14,
    },
    resendLink: {
      color: c.red,
      fontSize: 14,
      fontWeight: "700",
    },
    resendCountdown: {
      color: c.textSubtle,
      fontSize: 13,
      fontWeight: "500",
    },
    securityInfo: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    securityText: {
      color: c.textSubtle,
      fontSize: 11,
      letterSpacing: 0.3,
    },
  }));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (expiryTimer <= 0) return;
    const id = setInterval(() => setExpiryTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [expiryTimer]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shakeAnim]);

  const handleVerify = async () => {
    const otpCode = code.join("");
    if (otpCode.length < OTP_LENGTH) {
      setHasError(true);
      triggerShake();
      return;
    }
    Keyboard.dismiss();
    setHasError(false);
    try {
      await verifyOtp({
        email: params.email,
        code: otpCode,
      });
    } catch {
      setHasError(true);
      triggerShake();
      setCode(Array(OTP_LENGTH).fill(""));
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;
    try {
      await resendOtp(params.email);
      setResendTimer(RESEND_COOLDOWN);
      setExpiryTimer(OTP_EXPIRY);
      setCode(Array(OTP_LENGTH).fill(""));
      setHasError(false);
    } catch {}
  };

  const codeComplete = code.every(Boolean);
  useEffect(() => {
    if (codeComplete) handleVerify();
  }, [codeComplete]);

  const isExpired = expiryTimer <= 0;
  // ✅ La couleur du timer s'adapte au thème (colors.amber au lieu de CODE_DUR)
  const timerColor =
    expiryTimer <= 60
      ? "#EF4444"
      : expiryTimer <= 180
        ? colors.amber
        : colors.red;

  return (
    <View style={styles.container}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      <View style={styles.haloCenter} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={19} color={colors.white} />
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.body,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.iconWrap}>
              <View style={styles.iconOuter}>
                <View style={styles.iconInner}>
                  <Ionicons name="mail-outline" size={32} color={colors.red} />
                </View>
              </View>
              {codeComplete && !hasError && (
                <View style={styles.iconBadge}>
                  <Ionicons name="checkmark" size={12} color={colors.white} />
                </View>
              )}
            </View>

            <View style={styles.textBlock}>
              <Text style={styles.title}>Vérifiez votre email</Text>
              <Text style={styles.subtitle}>
                Code envoyé à{" "}
                <Text style={styles.emailHighlight}>
                  {maskEmail(params.email)}
                </Text>
              </Text>
            </View>

            <OtpInput
              code={code}
              onCodeChange={(c) => {
                setCode(c);
                if (hasError) setHasError(false);
              }}
              hasError={hasError}
              shakeAnim={shakeAnim}
              colors={colors}
            />

            {hasError && (
              <View style={styles.errorCard}>
                <Ionicons
                  name="alert-circle-outline"
                  size={15}
                  color="#EF4444"
                />
                <Text style={styles.errorText}>
                  Code incorrect ou expiré. Vérifiez votre email.
                </Text>
              </View>
            )}

            <View style={styles.timerBlock}>
              {isExpired ? (
                <View style={styles.expiredCard}>
                  <Ionicons name="time-outline" size={16} color="#EF4444" />
                  <Text style={styles.expiredText}>
                    Code expiré — demandez-en un nouveau
                  </Text>
                </View>
              ) : (
                <>
                  <View
                    style={[styles.timerCircle, { borderColor: timerColor }]}
                  >
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={timerColor}
                    />
                  </View>
                  <Text style={[styles.timerText, { color: timerColor }]}>
                    {formatTime(expiryTimer)}
                  </Text>
                  <Text style={styles.timerLabel}>avant expiration</Text>
                </>
              )}
            </View>
          </Animated.View>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleVerify}
              activeOpacity={0.85}
              style={[
                styles.ctaBtn,
                (isPending || isExpired) && styles.ctaBtnDisabled,
              ]}
              disabled={isPending || isExpired}
            >
              {isPending ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <Text style={styles.ctaBtnText}>Vérifier le code</Text>
                  <View style={styles.ctaBtnIcon}>
                    <Ionicons
                      name="checkmark-outline"
                      size={17}
                      color={colors.white}
                    />
                  </View>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Pas reçu ? </Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={resendTimer > 0 || isResending}
                activeOpacity={0.7}
              >
                {isResending ? (
                  <ActivityIndicator size="small" color={colors.red} />
                ) : resendTimer > 0 ? (
                  <Text style={styles.resendCountdown}>
                    Renvoyer dans {formatTime(resendTimer)}
                  </Text>
                ) : (
                  <Text style={styles.resendLink}>Renvoyer le code</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.securityInfo}>
              <Ionicons
                name="shield-checkmark-outline"
                size={13}
                color={colors.textSubtle}
              />
              <Text style={styles.securityText}>
                Code valide 10 minutes · Ne le partagez jamais
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}
