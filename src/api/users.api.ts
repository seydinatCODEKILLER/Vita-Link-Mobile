import {
  UpdateLocationPayload,
  UpdateProfilePayload,
  User,
} from "@/src/types/user.types";
import { api } from "./client";
import { buildApiBody } from "@/src/utils/form-data.utils";

export const usersApi = {
  // ── GET /users/me ─────────────────────────────────────────
  getMe: async (): Promise<User> => {
    const { data } = await api.get<{ success: boolean; user: User }>(
      "/users/me",
    );
    return data.user;
  },

  // ── PATCH /users/me ───────────────────────────────────────
  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const { data } = await api.patch<{ success: boolean; user: User }>(
      "/users/me",
      payload,
    );
    return data.user;
  },

  // ── PATCH /users/me/avatar ────────────────────────────────
  updateAvatar: async (imageUri: string): Promise<User> => {
    const { body, isMultipart } = buildApiBody(
      { avatarUri: imageUri },
      "avatarUri",
      "avatar",
    );

    const { data } = await api.patch<{ success: boolean; user: User }>(
      "/users/me/avatar",
      body,
      {
        headers: isMultipart
          ? { "Content-Type": "multipart/form-data" }
          : undefined,
      },
    );
    return data.user;
  },

  // ── PATCH /users/me/location ──────────────────────────────
  updateLocation: async (
    payload: UpdateLocationPayload,
  ): Promise<{ id: string; latitude: number; longitude: number }> => {
    const { data } = await api.patch<{
      success: boolean;
      user: { id: string; latitude: number; longitude: number };
    }>("/users/me/location", payload);
    return data.user;
  },

  // ── PATCH /users/me/expo-token ────────────────────────────
  updateExpoToken: async (expoPushToken: string): Promise<void> => {
    await api.patch("/users/me/expo-token", { expoPushToken });
  },

  // ── DELETE /users/me ──────────────────────────────────────
  deleteAccount: async (): Promise<{ message: string }> => {
    const { data } = await api.delete<{ success: boolean; message: string }>(
      "/users/me",
    );
    return data;
  },
};
