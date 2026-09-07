import { useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  HardHat,
  LayoutDashboard,
  LogOut,
  Menu,
  UserCog,
  X,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useLogout } from "@/features/auth/hooks/useAuthActions";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import type { RolNombre } from "@/features/auth/types/auth.types";
import { useCapacidadesAsistencia } from "@/features/asistencia/hooks/useAsistencias";
import { useEmpresa } from "@/features/empresa/hooks/useEmpresa";
import { EmpresaBrandMark } from "@/features/empresa/components/EmpresaBrandMark";
import {
  Avatar,
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui";
import { cn } from "@/shared/utils/cn";

const roleLabels: Record<RolNombre, string> = {
  ROLE_ADMIN: "Administrador",
  ROLE_RRHH: "Recursos Humanos",
  ROLE_OPERARIO: "Operario",
};

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useSessionStore((state) => state.user)!;
  const capacidadesQuery = useCapacidadesAsistencia();
  const empresaQuery = useEmpresa();
  const empresa = empresaQuery.data;
  const logout = useLogout();
  const location = useLocation();
  const navigate = useNavigate();
  const initials =
    `${user.nombre.at(0) ?? ""}${user.apellido.at(0) ?? ""}`.toUpperCase();
  const canManageUsers = user.rol === "ROLE_ADMIN" || user.rol === "ROLE_RRHH";
  const capacidades = capacidadesQuery.isError
    ? undefined
    : capacidadesQuery.data;
  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ...(canManageUsers
      ? [
          { to: "/obras", label: "Obras", icon: HardHat },
          { to: "/usuarios", label: "Usuarios", icon: UserCog },
        ]
      : []),
    ...(user.rol === "ROLE_ADMIN"
      ? [{ to: "/mi-empresa", label: "Mi Empresa", icon: Building2 }]
      : []),
    ...(capacidades?.parteDiario?.puedeConsultar
      ? [
          {
            to: "/asistencias",
            label: "Asistencias",
            icon: ClipboardCheck,
          },
        ]
      : []),
    ...(capacidades?.puedeConsultarMisAsistencias
      ? [
          {
            to: "/mis-asistencias",
            label: "Mis asistencias",
            icon: ClipboardList,
          },
        ]
      : []),
  ];

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch {
      /* La sesión se limpia en onSettled. */
    }
    navigate("/login", { replace: true });
  };

  const sidebar = (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-muted transition-[width] duration-200",
        collapsed ? "lg:w-20" : "lg:w-64",
        "w-72",
      )}
    >
      <div className="flex h-[73px] items-center justify-between border-b border-border px-5">
        <EmpresaBrandMark empresa={empresa} showLabel={!collapsed || mobileOpen} />
        <button
          className="rounded-control p-1.5 text-foreground-muted hover:bg-border lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar menú"
        >
          <X className="size-5" />
        </button>
      </div>
      <nav
        className="flex-1 space-y-1 overflow-y-auto p-3"
        aria-label="Navegación principal"
      >
        {navItems.map(({ to, label, icon: Icon }) => {
          const isCurrentActive =
            location.pathname === to ||
            location.pathname.startsWith(`${to}/`) ||
            (to === "/obras" &&
              (location.pathname.startsWith("/obras") ||
                location.pathname.startsWith("/configuracion-obras")));

          return (
            <Tooltip key={to}>
              <TooltipTrigger asChild>
                <NavLink
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group relative flex h-11 items-center gap-3 rounded-control px-3 text-sm font-medium transition-colors",
                    isCurrentActive
                      ? "bg-primary text-white shadow-soft before:absolute before:-left-3 before:top-1/2 before:h-8 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-accent"
                      : "text-foreground hover:bg-border",
                    collapsed && !mobileOpen && "justify-center px-0",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5 shrink-0 transition-colors",
                      isCurrentActive
                        ? "text-white"
                        : "text-foreground-muted group-hover:text-primary",
                    )}
                  />
                  {!collapsed || mobileOpen ? (
                    <>
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-left",
                          isCurrentActive ? "text-white" : "text-foreground",
                        )}
                      >
                        {label}
                      </span>
                      {isCurrentActive ? (
                        <ChevronRight className="size-4 shrink-0 text-white/75" />
                      ) : null}
                    </>
                  ) : null}
                </NavLink>
              </TooltipTrigger>
              {collapsed && !mobileOpen ? (
                <TooltipContent side="right">{label}</TooltipContent>
              ) : null}
            </Tooltip>
          );
        })}
      </nav>
      <div className="hidden border-t border-border p-3 lg:block">
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
        >
          <ChevronLeft
            className={cn("transition-transform", collapsed && "rotate-180")}
          />
          {!collapsed ? "Contraer" : null}
        </Button>
      </div>
      <div className="border-t border-border bg-border/70 p-3">
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed && !mobileOpen && "justify-center",
          )}
        >
          <Avatar>{initials || "US"}</Avatar>
          {!collapsed || mobileOpen ? (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">
                  {user.nombre} {user.apellido}
                </p>
                <p className="truncate text-xs text-foreground-muted">
                  {roleLabels[user.rol]}
                </p>
              </div>
              <button
                className="rounded-control p-2 text-foreground-muted hover:bg-error-soft hover:text-error"
                onClick={handleLogout}
                disabled={logout.isPending}
                aria-label="Cerrar sesión"
              >
                <LogOut className="size-4" />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-page">
      <div className="hidden lg:block">{sidebar}</div>
      {mobileOpen ? (
        <>
          <button
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">{sidebar}</div>
        </>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[73px] shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-8">
          <button
            className="rounded-control p-2 text-foreground-muted hover:bg-subtle lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="size-6" />
          </button>
          <div className="ml-auto text-right">
            <p className="text-sm font-semibold text-foreground">
              {user.nombre} {user.apellido}
            </p>
            <p className="text-xs text-foreground-muted">
              {roleLabels[user.rol]}
            </p>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1366px] p-4 sm:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
