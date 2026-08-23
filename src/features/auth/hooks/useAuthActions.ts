import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/authApi";
import { useSessionStore } from "../store/sessionStore";
import { setAccessToken } from "@/shared/lib/http/tokenManager";
import type { GoogleLoginRequest, LoginRequest } from "../types/auth.types";

async function establishSession(jwt: string) {
  setAccessToken(jwt);
  return authApi.me();
}

export function useLogin() {
  const setSession = useSessionStore((state) => state.setSession);
  return useMutation({
    mutationFn: async (payload: LoginRequest) => establishSession((await authApi.login(payload)).jwt),
    onSuccess: setSession,
  });
}

export function useGoogleLogin() {
  const setSession = useSessionStore((state) => state.setSession);
  return useMutation({
    mutationFn: async (payload: GoogleLoginRequest) => establishSession((await authApi.loginWithGoogle(payload)).jwt),
    onSuccess: setSession,
  });
}

export function useLogout() {
  const clearSession = useSessionStore((state) => state.clearSession);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      setAccessToken(null);
      clearSession();
      queryClient.clear();
    },
  });
}
