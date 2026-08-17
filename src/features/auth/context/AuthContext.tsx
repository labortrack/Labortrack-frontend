import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import type { AuthLoginRequestDto } from '../types/auth.dto';

// 1. Contrato de lo que el Contexto expone a los componentes
interface AuthContextType {
  email: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: AuthLoginRequestDto) => Promise<void>;
  logout: () => Promise<void>;
}

// 2. Creación del objeto Contexto (inicialmente undefined)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Componente Proveedor (Provider): administra el estado real
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Al recargar la página (F5): recupera la sesión previa desde localStorage
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    const storedEmail = localStorage.getItem('user_email');

    if (token && storedEmail) {
      setEmail(storedEmail);
    }
    setLoading(false);
  }, []);

  // Función de Login: orquesta API + persistencia local + actualización de estado
  const login = async (credentials: AuthLoginRequestDto): Promise<void> => {
    const response = await authApi.login(credentials);

    // Guardamos tokens y datos mínimos en el almacenamiento del navegador
    localStorage.setItem('jwt', response.jwt);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user_email', response.email);

    // Actualizamos el estado en memoria para que la UI reaccione inmediatamente
    setEmail(response.email);
  };

  // Función de Logout: invalida en el backend y limpia el navegador
  const logout = async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await authApi.logout({ refreshToken });
      } catch (error) {
        console.error('Error al invalidar el refresh token en el backend:', error);
      }
    }

    localStorage.clear();
    setEmail(null);
  };

  // 4. Inyección de valores a todos los componentes hijos
  return (
    <AuthContext.Provider
      value={{
        email,
        isAuthenticated: !!email, // Convierte el string o null en un booleano (true/false)
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 5. Custom Hook de conveniencia para consumir el contexto fácilmente
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un <AuthProvider>');
  }
  return context;
};