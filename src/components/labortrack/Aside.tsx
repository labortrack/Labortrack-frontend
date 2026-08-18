import * as React from "react";
import { cn } from "../ui/utils";
import { DisplayXS, CaptionMD, LabelXS } from "./Typography";
import {
    LayoutDashboard,
    Users,
    UserCog,
    HardHat,
    Calendar,
    ClipboardCheck,
    ClipboardList,
    UserX,
    FileText,
    BookOpen,
    Sparkles,
    Building2,
    ChevronRight,
    ShieldCheck,
    CalendarOff,
    CalendarDays,
    Briefcase,
    LogOut,
} from "lucide-react";

export interface UserInfo {
    name: string;
    role: string;
    email?: string;
    initials: string;
    bg?: string;
}

export interface AsideProps {
    activeItem?: string;
    onItemClick?: (itemId: string) => void;
    className?: string;
    userInfo?: UserInfo;
    hiddenItems?: string[];
    onLogout?: () => void;
}

interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
}

export const navigationItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "legajos", label: "Legajos", icon: Users },
    { id: "usuarios", label: "Usuarios", icon: UserCog },
    { id: "obras", label: "Obras", icon: HardHat },
    { id: "jornadas", label: "Jornadas", icon: Calendar },
    { id: "asistencia", label: "Asistencias", icon: ClipboardCheck },
    { id: "ausencias", label: "Ausencias", icon: UserX },
    { id: "recibos", label: "Recibos", icon: FileText },
    { id: "documentacion", label: "Documentación", icon: BookOpen },
    { id: "ia", label: "IA", icon: Sparkles, badge: "NUEVO" },
    { id: "higiene", label: "Higiene y Seguridad", icon: ShieldCheck },
    { id: "mi-empresa", label: "Mi empresa", icon: Briefcase },
    // Accesos Personales / Operario
    { id: "mis-asistencias", label: "Mis asistencias", icon: ClipboardList },
    { id: "mis-ausencias", label: "Mis ausencias", icon: CalendarOff },
    { id: "mis-jornadas", label: "Mis jornadas", icon: CalendarDays },
    { id: "mis-recibos", label: "Mis recibos", icon: FileText },
];

export function Aside({
    activeItem = "dashboard",
    onItemClick,
    className,
    userInfo,
    hiddenItems = [],
    onLogout,
}: AsideProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    const visibleItems = navigationItems.filter(
        (item) => !hiddenItems.includes(item.id)
    );

    return (
        <aside
            className={cn(
                "flex flex-col bg-[#f0eded] border-r border-[#e8e8e8] transition-all duration-300 select-none h-screen sticky top-0",
                isCollapsed ? "w-20" : "w-64",
                className
            )}
        >
            {/* Header */}
            <div className="px-6 py-8 border-b border-[#e8e8e8]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0036a4] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    {!isCollapsed && (
                        <DisplayXS className="text-[#1c1b1b]">
                            LaborTrack
                        </DisplayXS>
                    )}
                </div>
                {!isCollapsed && (
                    <CaptionMD className="text-[#636363] mt-2">
                        Control de Personal
                    </CaptionMD>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 overflow-y-auto">
                <ul className="space-y-1">
                    {visibleItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeItem === item.id;

                        return (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    onClick={() => onItemClick?.(item.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-[0.25rem] transition-all group relative",
                                        isActive
                                            ? "bg-[#0036a4] text-white shadow-sm"
                                            : "text-[#636363] hover:bg-[#e8e8e8] hover:text-[#1c1b1b]"
                                    )}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    {/* Active rail naranja (Figma) */}
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#ff9d2e] rounded-r-full -ml-3" />
                                    )}

                                    <Icon
                                        className={cn(
                                            "w-5 h-5 flex-shrink-0 transition-colors",
                                            isActive ? "text-white" : "text-[#636363] group-hover:text-[#0036a4]"
                                        )}
                                    />

                                    {!isCollapsed && (
                                        <>
                                            <span
                                                className={cn(
                                                    "flex-1 text-left text-[14px] leading-[21px] font-medium truncate",
                                                    isActive ? "text-white" : "text-[#1c1b1b]"
                                                )}
                                            >
                                                {item.label}
                                            </span>

                                            {item.badge && (
                                                <span className="px-2 py-0.5 bg-[#ff9d2e] text-white text-[10px] leading-[14px] font-bold rounded-full uppercase tracking-wider">
                                                    {item.badge}
                                                </span>
                                            )}

                                            {isActive && (
                                                <ChevronRight className="w-4 h-4 text-white opacity-75" />
                                            )}
                                        </>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Collapse Toggle */}
            <div className="px-3 py-4 border-t border-[#e8e8e8]">
                <button
                    type="button"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-[#636363] hover:text-[#0036a4] hover:bg-[#e8e8e8] rounded-[0.25rem] transition-colors"
                    title={isCollapsed ? "Expandir menú" : "Contraer menú"}
                >
                    <div
                        className={cn(
                            "flex items-center gap-2 transition-transform",
                            isCollapsed && "rotate-180"
                        )}
                    >
                        <div className="flex gap-0.5">
                            <div className="w-1 h-4 bg-[#636363] rounded-full" />
                            <div className="w-1 h-4 bg-[#636363] rounded-full" />
                            {!isCollapsed && <div className="w-1 h-4 bg-[#636363] rounded-full" />}
                        </div>
                    </div>
                    {!isCollapsed && (
                        <LabelXS className="text-[#636363]">Contraer</LabelXS>
                    )}
                </button>
            </div>

            {/* User Section */}
            {!isCollapsed && (
                <div className="px-6 py-4 border-t border-[#e8e8e8] bg-[#e8e8e8]">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0"
                            style={{ backgroundColor: userInfo?.bg ?? "#0036a4" }}
                        >
                            {userInfo?.initials ?? "AD"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[14px] leading-[18px] font-bold text-[#1c1b1b] truncate">
                                {userInfo?.name ?? "Admin Usuario"}
                            </div>
                            <div className="text-[12px] leading-[16px] text-[#636363] truncate">
                                {userInfo?.role ?? "admin@labortrack.com"}
                            </div>
                            {userInfo?.email && (
                                <div className="text-[11px] leading-[15px] text-[#636363] truncate">
                                    {userInfo.email}
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={onLogout}
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[0.25rem] text-[#636363] transition-colors hover:bg-[#fdf0f0] hover:text-[#ba1a1a]"
                            title="Cerrar Sesión"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </aside>
    );
}