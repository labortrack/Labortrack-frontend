import { useState, type ComponentType, type ReactNode } from "react";
import { CalendarClock, CalendarDays, Users } from "lucide-react";
import { Card } from "@/shared/ui";
import { EmptyState } from "@/shared/components";
import { cn } from "@/shared/utils/cn";
import type {
  CuadrillaResponseDto,
  EmpleadoGrupoCuadrillaResponseDto,
} from "../types/cuadrilla.types";
import { CuadrillaNominaTable } from "./CuadrillaNominaTable";
import { PlanesTrabajoPanel } from "@/features/jornada/components/PlanesTrabajoPanel";

export type CuadrillaWorkspaceSection = "nomina" | "planes" | "jornadas";

interface Props {
  cuadrilla: CuadrillaResponseDto;
  operarios: EmpleadoGrupoCuadrillaResponseDto[];
  isLoadingOperarios: boolean;
  isErrorOperarios: boolean;
  onRetryOperarios: () => void;
  onAsignarOperario: () => void;
  onDesvincularOperario: (operario: EmpleadoGrupoCuadrillaResponseDto) => void;
  readOnly?: boolean;
  initialSection?: CuadrillaWorkspaceSection;
  onSectionChange?: (section: CuadrillaWorkspaceSection) => void;
  canViewPlans?: boolean;
}

const sections: Array<{
  id: CuadrillaWorkspaceSection;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { id: "nomina", label: "Nómina", icon: Users },
  { id: "planes", label: "Planes de trabajo", icon: CalendarDays },
  { id: "jornadas", label: "Jornadas", icon: CalendarClock },
];

export function CuadrillaWorkspace({
  cuadrilla,
  operarios,
  isLoadingOperarios,
  isErrorOperarios,
  onRetryOperarios,
  onAsignarOperario,
  onDesvincularOperario,
  readOnly = false,
  initialSection = "nomina",
  onSectionChange,
  canViewPlans = true,
}: Props) {
  const [active, setActive] = useState<CuadrillaWorkspaceSection>(
    initialSection === "planes" && !canViewPlans ? "nomina" : initialSection,
  );

  const selectSection = (section: CuadrillaWorkspaceSection) => {
    if (section === "planes" && !canViewPlans) return;
    setActive(section);
    onSectionChange?.(section);
  };

  let content: ReactNode;
  if (active === "nomina") {
    content = (
      <CuadrillaNominaTable
        cuadrilla={cuadrilla}
        operarios={operarios}
        isLoading={isLoadingOperarios}
        isError={isErrorOperarios}
        onRetry={onRetryOperarios}
        onAsignarOperario={onAsignarOperario}
        onDesvincularOperario={onDesvincularOperario}
        readOnly={readOnly}
      />
    );
  } else if (active === "planes") {
    content = <PlanesTrabajoPanel cuadrillaId={cuadrilla.id} />;
  } else {
    content = (
      <Card className="min-w-0 overflow-hidden border-border shadow-sm">
        <EmptyState
          title="Consulta de jornadas"
          description="Esta sección queda preparada para la consulta consolidada de jornadas de la cuadrilla, que corresponde a la siguiente historia del módulo. Las jornadas generadas por cada plan ya pueden consultarse desde su detalle."
        />
      </Card>
    );
  }

  return (
    <section aria-label={`Espacio de trabajo de ${cuadrilla.nombre}`}>
      <div className="mb-3 grid grid-cols-3 gap-2 lg:hidden" role="tablist">
        {sections.map(({ id, label, icon: Icon }) => {
          const disabled = id === "planes" && !canViewPlans;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active === id}
              disabled={disabled}
              onClick={() => selectSection(id)}
              className={cn(
                "flex min-h-11 items-center justify-center gap-2 rounded-control border px-2 text-xs font-semibold transition-colors",
                active === id
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-foreground-muted hover:border-primary/40 hover:text-primary",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <Icon className="size-4" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="hidden min-h-[360px] items-stretch gap-3 lg:flex">
        <div className="min-w-0 flex-1" role="tabpanel">
          {content}
        </div>
        <div className="flex gap-2" role="tablist" aria-orientation="vertical">
          {sections
            .filter(({ id }) => id !== active)
            .map(({ id, label, icon: Icon }) => {
              const disabled = id === "planes" && !canViewPlans;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-label={label}
                  aria-selected={false}
                  title={disabled ? "Sin permisos para consultar planes" : label}
                  disabled={disabled}
                  onClick={() => selectSection(id)}
                  className={cn(
                    "group flex w-14 items-start justify-center rounded-card border border-border bg-card pt-6 text-foreground-muted shadow-sm transition-all hover:border-primary/40 hover:bg-primary-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                    disabled && "cursor-not-allowed opacity-50 hover:border-border hover:bg-card hover:text-foreground-muted",
                  )}
                >
                  <Icon className="size-5" />
                  <span className="sr-only">Abrir {label}</span>
                </button>
              );
            })}
        </div>
      </div>

      <div className="lg:hidden" role="tabpanel">
        {content}
      </div>
    </section>
  );
}
