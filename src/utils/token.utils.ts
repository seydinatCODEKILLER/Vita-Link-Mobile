import { PUBLIC_ENDPOINTS } from "@/src/config/api.config";
import * as SecureStore from "expo-secure-store";

const KEYS = {
  ACCESS_TOKEN: "vitalink_access_token",
  REFRESH_TOKEN: "vitalink_refresh_token",
} as const;

class TokenManager {
  private logoutHandler: ((reason?: string) => void) | null = null;
  private refreshSubscribers: ((token: string) => void)[] = [];
  isRefreshing = false;

  // ── SecureStore ──────────────────────────────────────────────

  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken),
      SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken),
    ]);
  }

  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
  }

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  }

  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
    ]);
  }

  // ── File d'attente pendant le refresh ───────────────────────

  subscribeTokenRefresh(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  onTokenRefreshed(newToken: string): void {
    this.refreshSubscribers.forEach((cb) => cb(newToken));
    this.refreshSubscribers = [];
  }

  onRefreshFailed(): void {
    this.refreshSubscribers = [];
  }

  // ── Logout ───────────────────────────────────────────────────

  setLogoutHandler(handler: (reason?: string) => void): void {
    this.logoutHandler = handler;
  }

  logout(reason?: string): void {
    this.logoutHandler?.(reason);
  }

  // ── Utils ────────────────────────────────────────────────────

  isPublicEndpoint(url: string): boolean {
    return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
  }
}

export const tokenManager = new TokenManager();
