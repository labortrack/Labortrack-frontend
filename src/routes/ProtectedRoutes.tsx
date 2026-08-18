import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth();

    // Espera a que termine la verificación inicial (F5) contra el backend
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#fcf9f8]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-[#0036a4]" />
                    <p className="text-[14px] font-medium text-[#636363]">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    // Si no está autenticado, redirige al login
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}