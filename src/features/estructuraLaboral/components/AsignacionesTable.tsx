import {
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/ui";
import { InitialsAvatar } from "@/shared/components/InitialsAvatar";
import { Search, CalendarClock } from "lucide-react";
import type {
  EmpleadoGrupoResponseDto,
  GrupoResponseDto,
} from "../types/estructuraLaboral.types";

interface AsignacionesTableProps {
  asignaciones: EmpleadoGrupoResponseDto[];
  grupos: GrupoResponseDto[];
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  filtroGrupo: string;
  onFiltroGrupoChange: (val: string) => void;
  filtroEstado: string;
  onFiltroEstadoChange: (val: string) => void;
  onFinalizar: (asig: EmpleadoGrupoResponseDto) => void;
  isLoading?: boolean;
}

export function AsignacionesTable({
  asignaciones,
  grupos,
  busqueda,
  onBusquedaChange,
  filtroGrupo,
  onFiltroGrupoChange,
  filtroEstado,
  onFiltroEstadoChange,
  onFinalizar,
  isLoading,
}: AsignacionesTableProps) {
  const filas = asignaciones.filter((a) => {
    const q = busqueda.toLowerCase().trim();
    const fullName = `${a.apellidoEmpleado} ${a.nombreEmpleado}`.toLowerCase();
    const matchSearch =
      !q ||
      fullName.includes(q) ||
      (a.dniEmpleado && a.dniEmpleado.includes(q));
    const matchGrupo =
      filtroGrupo === "all" || String(a.grupoId) === filtroGrupo;
    const matchEstado =
      filtroEstado === "all" ||
      (filtroEstado === "vigentes" && !a.fechaHastaEmpleadoGrupo) ||
      (filtroEstado === "historicas" && !!a.fechaHastaEmpleadoGrupo);
    return matchSearch && matchGrupo && matchEstado;
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters toolbar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground-muted" />
          <Input
            value={busqueda}
            onChange={(e) => onBusquedaChange(e.target.value)}
            placeholder="Buscar por nombre, DNI o CUIL..."
            className="pl-9 h-9 text-[13px] rounded-[0.25rem] border-border bg-card"
          />
        </div>

        {/* Grupo dropdown */}
        <Select value={filtroGrupo} onValueChange={onFiltroGrupoChange}>
          <SelectTrigger className="h-9 w-[200px] text-[13px] rounded-[0.25rem] border-border bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[13px]">
              Todos los Grupos
            </SelectItem>
            {grupos
              .filter((g) => g.activo)
              .map((g) => (
                <SelectItem
                  key={g.id}
                  value={String(g.id)}
                  className="text-[13px]"
                >
                  {g.tipoActividad}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Estado dropdown */}
        <Select value={filtroEstado} onValueChange={onFiltroEstadoChange}>
          <SelectTrigger className="h-9 w-[140px] text-[13px] rounded-[0.25rem] border-border bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vigentes" className="text-[13px]">
              Vigentes
            </SelectItem>
            <SelectItem value="historicas" className="text-[13px]">
              Históricas
            </SelectItem>
            <SelectItem value="all" className="text-[13px]">
              Todas
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Count */}
        <span className="text-[13px] text-foreground-muted ml-auto shrink-0">
          {filas.length} asignacion{filas.length !== 1 ? "es" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-[0.5rem] border border-border shadow-soft overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f7f7f7] border-b border-border">
              <TableHead className="py-3 px-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                  Empleado
                </span>
              </TableHead>
              <TableHead className="py-3 px-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                  Grupo / Especialidad
                </span>
              </TableHead>
              <TableHead className="py-3 px-4 w-[120px]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                  Fecha Inicio
                </span>
              </TableHead>
              <TableHead className="py-3 px-4 w-[130px] text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                  Fecha Fin
                </span>
              </TableHead>
              <TableHead className="py-3 px-4 w-[90px] text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                  Acciones
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-foreground-muted">
                  Cargando asignaciones...
                </TableCell>
              </TableRow>
            ) : filas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <span className="text-[13px] text-foreground-muted">
                    No se encontraron asignaciones registradas.
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              filas.map((asig) => {
                const nombreCompleto = `${asig.apellidoEmpleado}, ${asig.nombreEmpleado}`;
                return (
                  <TableRow
                    key={asig.id}
                    className={`border-b border-[#f0f0f0] transition-colors ${
                      asig.fechaHastaEmpleadoGrupo
                        ? "bg-[#fafafa] hover:bg-[#f5f5f5]"
                        : "hover:bg-[#f7f9ff]"
                    }`}
                  >
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <InitialsAvatar name={nombreCompleto} size="md" />
                        <div>
                          <span className="text-[13px] font-bold text-foreground block">
                            {nombreCompleto}
                          </span>
                          <span className="text-[12px] text-foreground-muted block">
                            DNI {asig.dniEmpleado || "—"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <span className="inline-flex items-center px-3 py-1 bg-[#e8f0ff] rounded-full text-[11px] font-bold text-primary">
                        {asig.tipoActividad}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <span className="text-[13px] text-foreground-muted">
                        {formatDate(asig.fechaDesdeEmpleadoGrupo)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center">
                      {asig.fechaHastaEmpleadoGrupo ? (
                        <span className="text-[13px] text-foreground-muted">
                          {formatDate(asig.fechaHastaEmpleadoGrupo)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-success-soft rounded-full">
                          <div className="size-1.5 bg-success rounded-full animate-pulse" />
                          <span className="text-[11px] font-bold text-success">
                            VIGENTE
                          </span>
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center">
                      {!asig.fechaHastaEmpleadoGrupo && (
                        <button
                          onClick={() => onFinalizar(asig)}
                          title="Finalizar asignación"
                          className="size-8 flex items-center justify-center rounded-[0.25rem] text-foreground-muted hover:text-accent-deep hover:bg-warning-soft transition-colors mx-auto cursor-pointer"
                        >
                          <CalendarClock className="size-4" />
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
