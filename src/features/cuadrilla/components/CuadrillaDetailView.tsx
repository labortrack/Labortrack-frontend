import type { ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { Building2, HardHat, Users } from "lucide-react";
import { InitialsAvatar } from "@/shared/components";
import { Card } from "@/shared/ui";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { useOperariosCuadrilla } from "../hooks/useCuadrillas";
import { CuadrillaStatusBadge } from "./CuadrillaStatusBadge";
import {
  CuadrillaWorkspace,
  type CuadrillaWorkspaceSection,
} from "./CuadrillaWorkspace";
import type {
  CuadrillaResponseDto,
  EmpleadoGrupoCuadrillaResponseDto,
} from "../types/cuadrilla.types";

function MetaItem({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 px-5 py-4">
      <span className="shrink-0 text-foreground-muted">{icon}</span>
      <div className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
          {label}
        </span>
        <div className="truncate text-sm font-semibold text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

type Props =
  | {
      cuadrilla: CuadrillaResponseDto;
      readOnly: true;
      onAsignarOperario?: never;
      onDesvincularOperario?: never;
    }
  | {
      cuadrilla: CuadrillaResponseDto;
      readOnly?: false;
      onAsignarOperario: () => void;
      onDesvincularOperario: (operario: EmpleadoGrupoCuadrillaResponseDto) => void;
    };

// Vista de una cuadrilla: resumen + nómina / planes / jornadas.
// La comparten la gestión (/obras/:obraId/cuadrillas/:cuadrillaId) y la vista
// del líder (/mi-cuadrilla, en modo solo lectura). La sección activa vive en ?seccion=.
export function CuadrillaDetailView({
  cuadrilla,
  readOnly = false,
  onAsignarOperario,
  onDesvincularOperario,
}: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const canViewPlans = useSessionStore((state) => state.user?.rol !== "ROLE_ADMIN");
  const operariosQuery = useOperariosCuadrilla(cuadrilla.id);

  const sectionParam = searchParams.get("seccion");
  const section: CuadrillaWorkspaceSection =
    sectionParam === "planes" || sectionParam === "jornadas"
      ? sectionParam
      : "nomina";

  const liderNombre = cuadrilla.lider
    ? `${cuadrilla.lider.nombre} ${cuadrilla.lider.apellido}`
    : null;

  return (
    <div className="space-y-6">
      {/* ── Meta summary ───────────────────────────────────────── */}
      <Card className="flex flex-col divide-y divide-border overflow-hidden shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:divide-x sm:divide-y-0">
        <MetaItem icon={<Building2 className="size-4" />} label="Obra">
          {cuadrilla.obra.nombreObra}
        </MetaItem>
        <MetaItem icon={<HardHat className="size-4" />} label="Especialidad">
          <span className="uppercase tracking-wide">
            {cuadrilla.grupo?.tipoActividad || "General"}
          </span>
        </MetaItem>
        <MetaItem
          icon={
            liderNombre ? (
              <InitialsAvatar
                name={liderNombre}
                size="sm"
                className="size-6 text-[10px]"
              />
            ) : (
              <Users className="size-4" />
            )
          }
          label="Líder Actual"
        >
          {liderNombre ?? (
            <span className="font-normal italic text-foreground-muted">
              Sin líder asignado
            </span>
          )}
        </MetaItem>
        <MetaItem icon={<Users className="size-4" />} label="Personal activo">
          {cuadrilla.operariosCount ?? 0} operario
          {cuadrilla.operariosCount !== 1 ? "s" : ""}
        </MetaItem>
        <div className="flex items-center gap-2.5 px-5 py-4 sm:ml-auto">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
            Estado Operativo
          </span>
          <CuadrillaStatusBadge estado={cuadrilla.estadoActual} />
        </div>
      </Card>

      {/* ── Workspace: nómina / planes / jornadas ─────────────── */}
      <CuadrillaWorkspace
        key={cuadrilla.id}
        cuadrilla={cuadrilla}
        operarios={operariosQuery.data ?? []}
        isLoadingOperarios={operariosQuery.isPending}
        isErrorOperarios={operariosQuery.isError}
        onRetryOperarios={() => void operariosQuery.refetch()}
        onAsignarOperario={onAsignarOperario ?? (() => undefined)}
        onDesvincularOperario={onDesvincularOperario ?? (() => undefined)}
        readOnly={readOnly}
        section={section}
        initialSection={section}
        canViewPlans={canViewPlans}
        onSectionChange={(next) =>
          setSearchParams((current) => {
            const params = new URLSearchParams(current);
            params.set("seccion", next);
            return params;
          })
        }
      />
    </div>
  );
}
