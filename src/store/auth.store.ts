import { create } from "zustand";
import { User } from "@/src/types/user.types";
import * as SecureStore from "expo-secure-store";
import { tokenManager } from "@/src/utils/token.utils";
import { registrationManager } from "@/src/utils/registration.utils";

const USER_KEY = "vitalink_user";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User) => Promise<void>;
  updateUser: (partialUser: Partial<User>) => Promise<void>;
  logout: (reason?: string) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: async (user) => {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  updateUser: async (partialUser) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...partialUser };
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  logout: async (reason?) => {
    if (reason) console.log("🔒 Logout:", reason);
    await Promise.all([
      tokenManager.clearTokens(),
      SecureStore.deleteItemAsync(USER_KEY),
      registrationManager.clearPendingDonor(),
    ]);
    set({ user: null, isAuthenticated: false });
  },

  initialize: async () => {
    try {
      const [userRaw, token] = await Promise.all([
        SecureStore.getItemAsync(USER_KEY),
        tokenManager.getAccessToken(),
      ]);

      if (userRaw && token) {
        const user: User = JSON.parse(userRaw);
        set({ user, isAuthenticated: true });
      } else {
        await get().logout();
      }
    } catch (error) {
      console.error("❌ Erreur initialisation auth:", error);
      await get().logout();
    } finally {
      set({ isLoading: false });
    }
  },
}));

// ── Connexion avec l'intercepteur Axios ──────────────────────
tokenManager.setLogoutHandler(async (reason?) => {
  await useAuthStore.getState().logout(reason);
});

