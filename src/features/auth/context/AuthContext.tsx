import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/authApi";
import type { AuthLoginRequestDto } from "../types/auth.dto";
import { setAccessTokenInMemory } from "@/api/axiosClient";

interface AuthContextType {
  email: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: AuthLoginRequestDto) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Si no hay marca de sesión activa previa, no hacemos la petición al backend
      const hasSession = localStorage.getItem("hasSession") === "true";
      if (!hasSession) {
        setLoading(false);
        return;
      }

      // 2. Si había sesión previa (ej: el usuario hizo F5), pedimos el nuevo token
      try {
        const response = await authApi.refresh();
        setAccessTokenInMemory(response.jwt);
        setEmail(response.email);
      } catch {
        // Si la cookie expiró o fue inválida, limpiamos la marca
        localStorage.removeItem("hasSession");
        setAccessTokenInMemory(null);
        setEmail(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login tradicional
  const login = async (credentials: AuthLoginRequestDto): Promise<void> => {
    const response = await authApi.login(credentials);
    setAccessTokenInMemory(response.jwt);
    setEmail(response.email);
    localStorage.setItem("hasSession", "true");
  };

  // Login con Google OAuth2
  const loginWithGoogle = async (idToken: string): Promise<void> => {
    const response = await authApi.loginWithGoogle({ idToken });
    setAccessTokenInMemory(response.jwt);
    setEmail(response.email);
    localStorage.setItem("hasSession", "true");
  };

  // Cierre de sesión
  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      localStorage.removeItem("hasSession");
      setAccessTokenInMemory(null);
      setEmail(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        email,
        isAuthenticated: !!email,
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un <AuthProvider>");
  }
  return context;
};