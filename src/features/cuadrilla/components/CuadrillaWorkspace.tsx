import { useState, type ComponentType } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarClock, CalendarDays, Plus, Users } from "lucide-react";
import { Button, Card } from "@/shared/ui";
import { EmptyState, SearchInput } from "@/shared/components";
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
  section?: CuadrillaWorkspaceSection;
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
  section,
  initialSection = "nomina",
  onSectionChange,
  canViewPlans = true,
}: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [internalActive, setInternalActive] = useState<CuadrillaWorkspaceSection>(
    initialSection === "planes" && !canViewPlans ? "nomina" : initialSection,
  );
  const active =
    section === "planes" && !canViewPlans
      ? "nomina"
      : section ?? internalActive;
  const nominaSearchTerm = searchParams.get("nominaBuscar") ?? "";

  const setNominaSearchTerm = (value: string) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set("nominaBuscar", value);
        else next.delete("nominaBuscar");
        return next;
      },
      { replace: true },
    );
  };

  const selectSection = (nextSection: CuadrillaWorkspaceSection) => {
    if (nextSection === "planes" && !canViewPlans) return;
    setInternalActive(nextSection);
    onSectionChange?.(nextSection);
  };

  const isSuspended = cuadrilla.estadoActual === "SUSPENDIDA";
  const isFinalizada = cuadrilla.estadoActual === "FINALIZADA";

  const renderActiveHeader = (compact = false) => {
    if (active === "nomina") {
      return (
        <div className={cn("flex min-w-0 gap-4", compact ? "flex-col" : "items-center justify-between")}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Users className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-base font-bold text-foreground">
                  Nómina Operativa de Cuadrilla
                </h3>
                <span className="shrink-0 rounded-full border border-primary/20 bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                  {operarios.length} operario{operarios.length !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-foreground-muted">
                Personal asignado a <span className="font-semibold text-foreground">{cuadrilla.nombre}</span> ({cuadrilla.grupo?.tipoActividad || "General"})
              </p>
            </div>
          </div>
          <div className={cn("flex shrink-0 items-center gap-3", compact && "w-full flex-col sm:flex-row")}>
            <div className={cn("w-56", compact && "w-full sm:flex-1")}>
              <SearchInput
                value={nominaSearchTerm}
                onChange={(event) => setNominaSearchTerm(event.target.value)}
                placeholder="Buscar por nombre o rol..."
                className="h-9 text-xs"
              />
            </div>
            {!readOnly ? (
              <Button
                type="button"
                onClick={onAsignarOperario}
                disabled={isSuspended || isFinalizada}
                className={cn("h-9 shrink-0 gap-1.5 text-xs font-semibold", compact && "w-full sm:w-auto")}
              >
                <Plus className="size-4" />
                Incorporar Operario
              </Button>
            ) : null}
          </div>
        </div>
      );
    }

    const isPlanes = active === "planes";
    const Icon = isPlanes ? CalendarDays : CalendarClock;
    return (
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-foreground">
            {isPlanes ? "Planes de trabajo" : "Jornadas"}
          </h3>
          <p className="mt-0.5 truncate text-xs text-foreground-muted">
            {isPlanes
              ? "Historial y planificación horaria de la cuadrilla."
              : "Seguimiento consolidado de las jornadas de la cuadrilla."}
          </p>
        </div>
      </div>
    );
  };

  const nominaContent = (
      <CuadrillaNominaTable
        cuadrilla={cuadrilla}
        operarios={operarios}
        isLoading={isLoadingOperarios}
        isError={isErrorOperarios}
        onRetry={onRetryOperarios}
        onAsignarOperario={onAsignarOperario}
        onDesvincularOperario={onDesvincularOperario}
        readOnly={readOnly}
        embedded
        searchTerm={nominaSearchTerm}
        onSearchTermChange={setNominaSearchTerm}
      />
  );

  return (
    <section aria-label={`Espacio de trabajo de ${cuadrilla.nombre}`}>
      <Card className="min-w-0 overflow-hidden border-border shadow-sm">
        <div className="border-b border-border bg-muted/20">
          <div className="grid grid-cols-3 lg:hidden" role="tablist">
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
                    "flex min-h-12 items-center justify-center gap-2 border-r border-border px-2 text-xs font-semibold transition-colors last:border-r-0",
                    active === id
                      ? "bg-primary text-white"
                      : "bg-card text-foreground-muted hover:bg-primary-soft hover:text-primary",
                    disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  <Icon className="size-4" />
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>
          <div className="p-4 lg:hidden">{renderActiveHeader(true)}</div>

          <div
            className="hidden min-h-[92px] w-full overflow-hidden lg:flex"
            role="group"
            aria-label="Secciones de la cuadrilla"
          >
            {sections.map(({ id, label, icon: Icon }, index) => {
              const isActive = active === id;
              const disabled = id === "planes" && !canViewPlans;
              return (
                <div
                  key={id}
                  className={cn(
                    "min-w-0 shrink-0 overflow-hidden transition-[width] duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
                    index > 0 && "border-l border-border",
                  )}
                  style={{
                    width: isActive ? "calc(100% - 7rem)" : "3.5rem",
                  }}
                >
                  {isActive ? (
                    <div
                      className="lt-accordion-header-enter h-full min-w-0 p-4 sm:p-5"
                    >
                      {renderActiveHeader()}
                    </div>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Abrir ${label}`}
                      title={disabled ? "Sin permisos para consultar planes" : label}
                      disabled={disabled}
                      onClick={() => selectSection(id)}
                      className={cn(
                        "flex h-full w-full items-center justify-center text-foreground-muted transition-colors hover:bg-primary-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30",
                        disabled && "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-foreground-muted",
                      )}
                    >
                      <Icon className="size-5 shrink-0" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div
          role="tabpanel"
          hidden={active !== "nomina"}
          className={cn(active === "nomina" && "lt-accordion-content-enter")}
        >
          {nominaContent}
        </div>
        {canViewPlans ? (
          <div
            role="tabpanel"
            hidden={active !== "planes"}
            className={cn(active === "planes" && "lt-accordion-content-enter")}
          >
            <PlanesTrabajoPanel cuadrillaId={cuadrilla.id} embedded />
          </div>
        ) : null}
        <div
          role="tabpanel"
          hidden={active !== "jornadas"}
          className={cn(active === "jornadas" && "lt-accordion-content-enter")}
        >
          <EmptyState
            title="Consulta de jornadas"
            description="Esta sección queda preparada para la consulta consolidada de jornadas de la cuadrilla, que corresponde a la siguiente historia del módulo. Las jornadas generadas por cada plan ya pueden consultarse desde su detalle."
          />
        </div>
      </Card>
    </section>
  );
}
