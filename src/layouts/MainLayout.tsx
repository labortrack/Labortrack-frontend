import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Aside } from "../components/labortrack/Aside";
import { useAuth } from "../features/auth/context/AuthContext";
import { Bell, Settings, Menu } from "lucide-react";

export default function MainLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { email, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const activeItem = location.pathname.split("/")[1] || "dashboard";

    const userEmail = email || "usuario@labortrack.com";
    const userName = userEmail.split("@")[0];
    const userInitials = userEmail.substring(0, 2).toUpperCase();

    const userInfo = {
        name: userName,
        role: "Administrador",
        email: userEmail,
        initials: userInitials,
        bg: "#0036a4",
    };

    const handleNavigation = (itemId: string) => {
        navigate(`/${itemId}`);
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-[#fcf9f8] flex">
            {/* Sidebar Responsive */}
            <Aside
                activeItem={activeItem}
                onItemClick={handleNavigation}
                userInfo={userInfo}
                onLogout={handleLogout}
                isMobileOpen={isMobileMenuOpen}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
            />

            {/* Área Principal */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Top Header Simplificado */}
                <header className="bg-white border-b border-[#e8e8e8] px-4 sm:px-8 py-3.5 flex-shrink-0">
                    <div className="flex items-center justify-between lg:justify-end gap-3">

                        {/* Botón Menú Hamburguesa (Solo en Mobile/Tablet) */}
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 text-[#636363] hover:text-[#0036a4] hover:bg-[#f7f7f7] rounded-lg transition-colors lg:hidden"
                            title="Abrir menú"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Acciones Rápidas */}
                        <div className="flex items-center gap-1.5 sm:gap-3">
                            <button
                                type="button"
                                onClick={() => navigate("/notificaciones")}
                                className="relative p-2 text-[#636363] hover:text-[#0036a4] hover:bg-[#f7f7f7] rounded-lg transition-colors cursor-pointer"
                                title="Notificaciones"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#fd942e] rounded-full" />
                            </button>
                            <button
                                type="button"
                                className="p-2 text-[#636363] hover:text-[#0036a4] hover:bg-[#f7f7f7] rounded-lg transition-colors cursor-pointer"
                                title="Configuración"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Contenido Inyectado */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                    <div className="max-w-[1366px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}