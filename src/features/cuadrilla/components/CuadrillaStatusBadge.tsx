import type { EstadoCuadrilla } from "../types/cuadrilla.types";
import { cn } from "@/shared/utils/cn";

interface CuadrillaStatusBadgeProps {
  estado: EstadoCuadrilla | string;
  className?: string;
  showDot?: boolean;
}

interface StatusConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  ACTIVA: {
    label: "Activa",
    badgeClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500 animate-pulse",
  },
  EN_ESPERA: {
    label: "En Espera",
    badgeClass:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotClass: "bg-amber-500",
  },
  PLANIFICADA: {
    label: "Planificada",
    badgeClass:
      "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    dotClass: "bg-sky-500",
  },
  SUSPENDIDA: {
    label: "Suspendida",
    badgeClass:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    dotClass: "bg-rose-500",
  },
  FINALIZADA: {
    label: "Finalizada",
    badgeClass:
      "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
    dotClass: "bg-zinc-400",
  },
};

export function CuadrillaStatusBadge({
  estado,
  className,
  showDot = true,
}: CuadrillaStatusBadgeProps) {
  const normalizedKey = (estado || "").toUpperCase();
  const config = STATUS_CONFIGS[normalizedKey] || {
    label: estado || "Desconocido",
    badgeClass: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors",
        config.badgeClass,
        className
      )}
    >
      {showDot && (
        <span className={cn("size-1.5 rounded-full", config.dotClass)} />
      )}
      {config.label}
    </span>
  );
}
