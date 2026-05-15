import React from "react";
import { BaseToast, ErrorToast } from "react-native-toast-message";

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#22C55E", backgroundColor: "#1A1A1A" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: "bold",
        color: "#FFFFFF",
      }}
      text2Style={{
        fontSize: 13,
        color: "rgba(255,255,255,0.70)",
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: "#DC2626", backgroundColor: "#1A1A1A" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: "bold",
        color: "#FFFFFF",
      }}
      text2Style={{
        fontSize: 13,
        color: "rgba(255,255,255,0.70)",
      }}
    />
  ),
};
