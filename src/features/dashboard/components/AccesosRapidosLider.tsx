import { CalendarDays, ClipboardList, HardHat, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

const ACCESOS: { to: string; label: string; descripcion: string; icon: LucideIcon }[] = [
  {
    to: "/asistencias",
    label: "Parte diario",
    descripcion: "Registrar y revisar la asistencia",
    icon: ClipboardList,
  },
  {
    to: "/jornadas",
    label: "Jornadas",
    descripcion: "Horarios y estado de las jornadas",
    icon: CalendarDays,
  },
  {
    to: "/mi-cuadrilla",
    label: "Mi cuadrilla",
    descripcion: "Integrantes y datos de la cuadrilla",
    icon: HardHat,
  },
];

export function AccesosRapidosLider() {
  return (
    <nav aria-label="Accesos rápidos" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {ACCESOS.map(({ to, label, descripcion, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className="flex items-center gap-3 rounded-card border border-border bg-card p-4 shadow-soft transition-colors hover:border-primary/40 hover:bg-primary-soft/40"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary">
            <Icon className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-foreground">{label}</span>
            <span className="block truncate text-xs text-foreground-muted">{descripcion}</span>
          </span>
        </Link>
      ))}
    </nav>
  );
}
