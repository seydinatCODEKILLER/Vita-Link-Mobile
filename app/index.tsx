import { Redirect } from "expo-router";
import { useIsAuthenticated, useUserRole } from "@/src/hooks/useAuthStore";

export default function Index() {
  const isAuthenticated = useIsAuthenticated();
  const role = useUserRole();

  // 1. Si non connecté → On va vers l'accueil auth
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // 2. Les admins n'ont pas d'interface mobile (ils ont un dashboard web)
  if (role === "ADMIN") {
    return <Redirect href="/unauthorized" />;
  }

  // 3. Le CNTS (Agents et Admins CNTS) → Va vers le groupe (health)
  if (role === "CNTS_AGENT" || role === "CNTS_ADMIN") {
    return <Redirect href="/(health)" />;
  }

  // 4. L'Hôpital (Agents hôpital) → Va vers le groupe (hospital)
  if (role === "HOSPITAL_AGENT") {
    return <Redirect href="/(hospital)" />;
  }

  // 5. ✅ Par défaut (DONOR ou rôle inconnu) → Accès non autorisé
  // Les donneurs utilisent désormais l'application dédiée "Vita-Link Donor"
  return <Redirect href="/unauthorized" />;
}