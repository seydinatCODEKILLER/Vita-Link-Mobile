import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useRouter } from "expo-router";

export function useWelcomeScreen() {
  const router = useRouter();

  // ── Animations ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ring2Anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(btnAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    );

    const pulse2 = Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(ring2Anim, {
          toValue: 1.1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(ring2Anim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();
    pulse2.start();

    return () => {
      pulse.stop();
      pulse2.stop();
    };
  }, []);

  // ── Actions ──
  const goToHospital = () => router.push("/register-hospital");
  const goToCnts = () => router.push("/register-cnts");
  const goToLogin = () => router.push("/login");

  return {
    fadeAnim,
    slideAnim,
    btnAnim,
    pulseAnim,
    ring2Anim,
    goToHospital,
    goToCnts,
    goToLogin,
  };
}
