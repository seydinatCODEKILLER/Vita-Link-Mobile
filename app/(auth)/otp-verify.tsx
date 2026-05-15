import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useVerifyOtp, useResendOtp } from "@/src/hooks/useAuth";

// ─── Palette ──────────────────────────────────────────────────
const COLORS = {
  bg: "#080808",
  red: "#DC1E1E",
  redGlow: "rgba(220,30,30,0.14)",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.40)",
  textSubtle: "rgba(255,255,255,0.18)",
  cardBg: "rgba(255,255,255,0.05)",
  cardBorder: "rgba(255,255,255,0.09)",
  inputBg: "#141414",
  success: "#22C55E",
} as const;

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 120; // secondes
const OTP_EXPIRY = 600; // 10 minutes en secondes

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
}

function OtpInput({ code, onCodeChange, hasError, shakeAnim }: OtpInputProps) {
  const inputRefs = useRef<(TextInput | null)[]>([]);

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

    // Auto-focus suivant
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

  const activeBorderColor = hasError ? "#EF4444" : COLORS.red;

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
              // ✅ CORRECTION ICI : Ajout des accolades pour retourner void
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
                        shadowColor: COLORS.red,
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
              maxLength={OTP_LENGTH} // permet le collage
              textAlign="center"
              selectTextOnFocus
              caretHidden
              selectionColor={COLORS.red}
            />
            {/* Point indicateur sous la cellule active vide */}
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
    phone: string;
    firstName: string;
    lastName: string;
    bloodType: string;
    gender: string;
    dateOfBirth: string;
  }>();

  const { mutateAsync: verifyOtp, isPending } = useVerifyOtp();
  const { mutateAsync: resendOtp, isPending: isResending } = useResendOtp();

  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [hasError, setHasError] = useState(false);
  const [expiryTimer, setExpiryTimer] = useState(OTP_EXPIRY);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // ── Animations d'entrée ──
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

  // ── Timer expiry ──
  useEffect(() => {
    if (expiryTimer <= 0) return;
    const id = setInterval(() => setExpiryTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [expiryTimer]);

  // ── Timer resend ──
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  // ── Shake animation on error ──
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

  // ── Submit ──
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
        phone: params.phone,
        firstName: params.firstName,
        lastName: params.lastName,
        bloodType: params.bloodType as any,
        gender: params.gender as any,
        dateOfBirth: params.dateOfBirth || undefined,
      });
    } catch {
      setHasError(true);
      triggerShake();
      setCode(Array(OTP_LENGTH).fill(""));
    }
  };

  // ── Resend ──
  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;
    try {
      await resendOtp(params.email);
      setResendTimer(RESEND_COOLDOWN);
      setExpiryTimer(OTP_EXPIRY);
      setCode(Array(OTP_LENGTH).fill(""));
      setHasError(false);
    } catch {
      // Erreur gérée par le hook (Toast)
    }
  };

  // Auto-submit quand le code est complet
  const codeComplete = code.every(Boolean);
  useEffect(() => {
    if (codeComplete) handleVerify();
  }, [codeComplete]);

  const isExpired = expiryTimer <= 0;
  const timerColor =
    expiryTimer <= 60 ? "#EF4444" : expiryTimer <= 180 ? "#FAC775" : COLORS.red;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Halo central */}
      <View style={styles.haloCenter} />

      <SafeAreaView style={styles.safeArea}>
        {/* ── Back ── */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={19} color={COLORS.white} />
        </TouchableOpacity>

        {/* ── Corps ── */}
        <Animated.View
          style={[
            styles.body,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Icône email */}
          <View style={styles.iconWrap}>
            <View style={styles.iconOuter}>
              <View style={styles.iconInner}>
                <Ionicons name="mail-outline" size={32} color={COLORS.red} />
              </View>
            </View>
            {/* Checkmark si code complet sans erreur */}
            {codeComplete && !hasError && (
              <View style={styles.iconBadge}>
                <Ionicons name="checkmark" size={12} color={COLORS.white} />
              </View>
            )}
          </View>

          {/* Texte */}
          <View style={styles.textBlock}>
            <Text style={styles.title}>Vérifiez votre email</Text>
            <Text style={styles.subtitle}>
              Code envoyé à{" "}
              <Text style={styles.emailHighlight}>
                {maskEmail(params.email)}
              </Text>
            </Text>
          </View>

          {/* OTP Inputs */}
          <OtpInput
            code={code}
            onCodeChange={(c) => {
              setCode(c);
              if (hasError) setHasError(false);
            }}
            hasError={hasError}
            shakeAnim={shakeAnim}
          />

          {/* Message d'erreur */}
          {hasError && (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle-outline" size={15} color="#EF4444" />
              <Text style={styles.errorText}>
                Code incorrect ou expiré. Vérifiez votre email.
              </Text>
            </View>
          )}

          {/* Timer expiry */}
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
                <View style={[styles.timerCircle, { borderColor: timerColor }]}>
                  <Ionicons name="time-outline" size={14} color={timerColor} />
                </View>
                <Text style={[styles.timerText, { color: timerColor }]}>
                  {formatTime(expiryTimer)}
                </Text>
                <Text style={styles.timerLabel}>avant expiration</Text>
              </>
            )}
          </View>
        </Animated.View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          {/* Bouton vérifier */}
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
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Text style={styles.ctaBtnText}>Vérifier le code</Text>
                <View style={styles.ctaBtnIcon}>
                  <Ionicons
                    name="checkmark-outline"
                    size={17}
                    color={COLORS.white}
                  />
                </View>
              </>
            )}
          </TouchableOpacity>

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Pas reçu ? </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={resendTimer > 0 || isResending}
              activeOpacity={0.7}
            >
              {isResending ? (
                <ActivityIndicator size="small" color={COLORS.red} />
              ) : resendTimer > 0 ? (
                <Text style={styles.resendCountdown}>
                  Renvoyer dans {formatTime(resendTimer)}
                </Text>
              ) : (
                <Text style={styles.resendLink}>Renvoyer le code</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Info sécurité */}
          <View style={styles.securityInfo}>
            <Ionicons
              name="shield-checkmark-outline"
              size={13}
              color={COLORS.textSubtle}
            />
            <Text style={styles.securityText}>
              Code valide 10 minutes · Ne le partagez jamais
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  safeArea: { flex: 1, paddingHorizontal: 24 },

  haloCenter: {
    position: "absolute",
    top: -80,
    left: "50%",
    marginLeft: -120,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: COLORS.redGlow,
  },

  // ── Back ──
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 32,
  },

  // ── Body ──
  body: {
    flex: 1,
    alignItems: "center",
  },

  // ── Icône ──
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
    backgroundColor: COLORS.success,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.bg,
  },

  // ── Texte ──
  textBlock: {
    alignItems: "center",
    gap: 8,
    marginBottom: 32,
  },
  title: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  emailHighlight: {
    color: COLORS.white,
    fontWeight: "600",
  },

  // ── OTP ──
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
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    color: COLORS.white,
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
    backgroundColor: COLORS.red,
  },

  // ── Error card ──
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

  // ── Timer ──
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
    color: COLORS.textMuted,
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

  // ── Footer ──
  footer: {
    paddingBottom: 10,
    gap: 14,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.red,
    borderRadius: 16,
    paddingVertical: 17,
  },
  ctaBtnDisabled: { opacity: 0.45 },
  ctaBtnText: {
    color: COLORS.white,
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
    color: COLORS.textMuted,
    fontSize: 14,
  },
  resendLink: {
    color: COLORS.red,
    fontSize: 14,
    fontWeight: "700",
  },
  resendCountdown: {
    color: COLORS.textSubtle,
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
    color: COLORS.textSubtle,
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
