import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

const THEME_KEY = "vitalink_theme";

// "system" retiré — non géré pour l'instant, évite le bug silencieux
type ThemeMode = "dark" | "light";

interface ThemeState {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void; // sync → void correct
  toggleTheme: () => void; // sync → void correct
  hydrateTheme: () => Promise<void>; // seul async légitime
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "dark",

  setTheme: (theme) => {
    set({ theme });
    // fire-and-forget : on ne bloque pas le state pour la persistance
    SecureStore.setItemAsync(THEME_KEY, theme);
  },

  toggleTheme: () => {
    const newTheme = get().theme === "dark" ? "light" : "dark";
    set({ theme: newTheme });
    SecureStore.setItemAsync(THEME_KEY, newTheme);
  },

  hydrateTheme: async () => {
    const saved = await SecureStore.getItemAsync(THEME_KEY);
    if (saved === "dark" || saved === "light") {
      set({ theme: saved });
    }
  },
}));
