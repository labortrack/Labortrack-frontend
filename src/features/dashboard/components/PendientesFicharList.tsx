import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { AsistenciaStatusBadge } from "@/features/asistencia/components/AsistenciaStatusBadge";
import type { PendienteFicharDto } from "../types/dashboard.types";

interface PendientesFicharListProps {
  data: PendienteFicharDto[];
  mostrarCuadrilla: boolean;
}

export function PendientesFicharList({ data, mostrarCuadrilla }: PendientesFicharListProps) {
  if (data.length === 0) {
    return (
      <p className="flex items-center gap-2 py-4 text-sm text-foreground-muted">
        <CheckCircle2 className="size-4 text-success" />
        Todo tu equipo tiene el fichaje al día.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {data.map((pendiente) => (
        <li key={pendiente.asistenciaId}>
          <Link
            to={`/asistencias/${pendiente.asistenciaId}`}
            className="-mx-2 flex items-center justify-between gap-3 rounded-control px-2 py-2.5 hover:bg-subtle"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {pendiente.nombreEmpleado}
              </p>
              {mostrarCuadrilla ? (
                <p className="truncate text-xs text-foreground-muted">{pendiente.nombreCuadrilla}</p>
              ) : null}
            </div>
            <AsistenciaStatusBadge estado={pendiente.estado} className="shrink-0" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
