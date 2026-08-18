import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/authApi";
import type { AuthLoginRequestDto } from "../types/auth.dto";
import { setAccessTokenInMemory } from "@/api/axiosClient";

interface AuthContextType {
  email: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: AuthLoginRequestDto) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await authApi.refresh();
        setAccessTokenInMemory(response.jwt);
        setEmail(response.email);
      } catch {
        setAccessTokenInMemory(null);
        setEmail(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: AuthLoginRequestDto): Promise<void> => {
    const response = await authApi.login(credentials);
    setAccessTokenInMemory(response.jwt);
    setEmail(response.email);
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
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