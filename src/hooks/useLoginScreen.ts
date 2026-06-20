import { useEffect, useRef } from "react";
import { Animated, Keyboard } from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/src/hooks/useAuth";
import { loginSchema, type LoginValues } from "@/src/validators/auth.schema";
import { useAuthStore } from "@/src/store/auth.store";

export function useLoginScreen() {
  const router = useRouter();
  const { mutateAsync: login, isPending } = useLogin();
  const user = useAuthStore((s) => s.user);

  // ── Redirect si déjà connecté ──
  useEffect(() => {
    if (user) {
      if (user.role === "CNTS_AGENT" || user.role === "CNTS_ADMIN") {
        router.replace("/(health)");
      } else if (user.role === "HOSPITAL_AGENT") {
        router.replace("/(hospital)");
      } else {
        router.replace("/unauthorized");
      }
    }
  }, [user]);

  // ── Animations d'entrée ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;

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

  // ── Form ──
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    Keyboard.dismiss();
    try {
      await login(values);
    } catch {
      // Toast géré dans useLogin → onError
    }
  };

  return {
    control,
    errors,
    handleSubmit,
    onSubmit,
    isPending,
    fadeAnim,
    slideAnim,
  };
}
