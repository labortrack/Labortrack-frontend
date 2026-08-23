const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8081";

export const env = {
  apiBaseUrl: apiBaseUrl.replace(/\/$/, ""),
  appName: import.meta.env.VITE_APP_NAME?.trim() || "LaborTrack",
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || "",
} as const;
