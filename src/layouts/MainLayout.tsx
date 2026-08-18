import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Aside } from "../components/labortrack/Aside";
import { useAuth } from "../features/auth/context/AuthContext";
import { Bell, Settings, Search } from "lucide-react";

export default function MainLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { email, logout } = useAuth();

    // 1. Extraer la ruta activa para iluminar el botón en el Aside (ej: /dashboard -> 'dashboard')
    const activeItem = location.pathname.split("/")[1] || "dashboard";

    // 2. Información del usuario obtenida del contexto real de Auth
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
            {/* Barra Lateral / Aside con tipografía y diseño Figma */}
            <Aside
                activeItem={activeItem}
                onItemClick={handleNavigation}
                userInfo={userInfo}
                onLogout={handleLogout}
            />

            {/* Contenedor Principal (Header + Contenido) */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Barra Superior / Header */}
                <header className="bg-white border-b border-[#e8e8e8] px-8 py-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 max-w-2xl">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757575] pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Buscar empleados, obras, documentos..."
                                    className="w-full h-10 pl-11 pr-4 text-[13px] text-[#1c1b1b] bg-[#f7f7f7] rounded-lg border border-transparent focus:border-[#0036a4] focus:bg-white focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 ml-6">
                            <button
                                type="button"
                                onClick={() => navigate("/notificaciones")}
                                className="relative p-2 text-[#636363] hover:text-[#0036a4] hover:bg-[#f7f7f7] rounded-lg transition-colors cursor-pointer"
                                title="Bandeja de notificaciones"
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

                {/* Vista dinámica donde se inyectan las páginas (Dashboard, Legajos, Obras, etc.) */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-[1366px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}