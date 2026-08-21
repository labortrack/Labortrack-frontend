import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/authApi";
import { usuarioApi } from "@/features/usuarios/api/usuarioApi";
import { setAccessTokenInMemory } from "@/api/axiosClient";
import type { AuthLoginRequestDto } from "../types/auth.dto";
import type { UserResponseDto } from "@/features/usuarios/types/usuario.types";

interface AuthContextType {
  user: UserResponseDto | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: AuthLoginRequestDto) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

function parseJwt(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    return JSON.parse(atob(base64Url.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Consulta el DTO completo del usuario autenticado
  const loadUserData = async (email: string) => {
    try {
      const page = await usuarioApi.findByFilter({ email });
      if (page.content.length > 0) {
        setUser(page.content[0]);
      }
    } catch (err) {
      console.error("Error al cargar datos del usuario:", err);
    }
  };

  const handleAuthSuccess = async (jwt: string, emailFromResponse?: string) => {
    setAccessTokenInMemory(jwt);
    const claims = parseJwt(jwt);
    const email = emailFromResponse || claims?.sub || claims?.email;

    if (email) {
      await loadUserData(email);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (localStorage.getItem("hasSession") !== "true") {
        setLoading(false);
        return;
      }
      try {
        const res: any = await authApi.refresh();
        await handleAuthSuccess(res.jwt, res.email);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (credentials: AuthLoginRequestDto) => {
    const res: any = await authApi.login(credentials);
    localStorage.setItem("hasSession", "true");
    await handleAuthSuccess(res.jwt, res.email);
  };

  const loginWithGoogle = async (idToken: string) => {
    const res: any = await authApi.loginWithGoogle({ idToken });
    localStorage.setItem("hasSession", "true");
    await handleAuthSuccess(res.jwt, res.email);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {}
    localStorage.removeItem("hasSession");
    setAccessTokenInMemory(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};