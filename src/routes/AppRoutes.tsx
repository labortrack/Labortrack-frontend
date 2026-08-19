import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../routes/ProtectedRoutes";
import MainLayout from "@/layouts/MainLayout";
import LoginPage from "@/features/auth/pages/LoginPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import UsuariosPage from "@/features/usuarios/pages/UsuarioPages";

export default function AppRoutes() {
    return (
        <Routes>
            {/* 1. Rutas Públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* 2. Rutas Protegidas (Requieren sesión activa) */}
            {/* 2. Rutas Protegidas */}
            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/usuarios" element={<UsuariosPage />} /> {/* 👈 Ruta conectada al Aside */}
                </Route>
            </Route>

            {/* 3. Fallback: Si no coincide ninguna ruta, manda al login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}