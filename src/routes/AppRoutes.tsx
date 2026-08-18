import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/features/auth/pages/LoginPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import ProtectedRoutes from "./ProtectedRoutes";

export default function AppRoutes() {
    return (
        <Routes>
            {/* Rutas Públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            {/* Rutas Protegidas */}
            <Route element={<ProtectedRoutes />}>
                <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}