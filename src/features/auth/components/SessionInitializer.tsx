import { useEffect, type ReactNode } from "react";
import { authApi } from "../api/authApi";
import { useSessionStore } from "../store/sessionStore";
import { refreshAccessToken } from "@/shared/lib/http/httpClient";
import { registerUnauthorizedHandler } from "@/shared/lib/http/sessionEvents";
import { setAccessToken } from "@/shared/lib/http/tokenManager";

export function SessionInitializer({ children }: { children: ReactNode }) {
  const setChecking = useSessionStore((state) => state.setChecking);
  const setSession = useSessionStore((state) => state.setSession);
  const clearSession = useSessionStore((state) => state.clearSession);

  useEffect(() => registerUnauthorizedHandler(clearSession), [clearSession]);

  useEffect(() => {
    let active = true;
    setChecking();
    void refreshAccessToken()
      .then(() => authApi.me())
      .then((user) => { if (active) setSession(user); })
      .catch(() => {
        setAccessToken(null);
        if (active) clearSession();
      });
    return () => { active = false; };
  }, [clearSession, setChecking, setSession]);

  return children;
}
