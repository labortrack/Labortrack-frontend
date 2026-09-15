import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/ui";
import { Layers, Users, Pencil, Trash2 } from "lucide-react";
import type {
  GrupoResponseDto,
  TabFiltroGrupo,
} from "../types/estructuraLaboral.types";

interface GruposTableProps {
  grupos: GrupoResponseDto[];
  vinculadosMap: Record<number, number>;
  filtroGrupo: TabFiltroGrupo;
  onFiltroChange: (tab: TabFiltroGrupo) => void;
  onEdit: (grupo: GrupoResponseDto) => void;
  onDelete: (grupo: GrupoResponseDto) => void;
  isLoading?: boolean;
}

export function GruposTable({
  grupos,
  vinculadosMap,
  filtroGrupo,
  onFiltroChange,
  onEdit,
  onDelete,
  isLoading,
}: GruposTableProps) {
  const tabs: TabFiltroGrupo[] = ["Activos", "Inactivos", "Todos"];

  const tabCounts: Record<TabFiltroGrupo, number> = {
    Activos: grupos.filter((g) => g.activo).length,
    Inactivos: grupos.filter((g) => !g.activo).length,
    Todos: grupos.length,
  };

  const filas = grupos.filter((g) => {
    if (filtroGrupo === "Activos") return g.activo;
    if (filtroGrupo === "Inactivos") return !g.activo;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-[#f0eded] rounded-[0.5rem] border border-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onFiltroChange(tab)}
              className={`flex items-center gap-1.5 px-4 h-8 rounded-[0.25rem] transition-all text-[13px] font-semibold cursor-pointer ${
                filtroGrupo === tab
                  ? "bg-white text-primary shadow-soft"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              {tab}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                  filtroGrupo === tab
                    ? "bg-[#e8f0ff] text-primary"
                    : "bg-[#e8e8e8] text-foreground-muted"
                }`}
              >
                {tabCounts[tab]}
              </span>
            </button>
          ))}
        </div>
        <span className="text-[13px] text-foreground-muted">
          {filas.length} grupo{filas.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-[0.5rem] border border-border shadow-soft overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f7f7f7] border-b border-border">
              <TableHead className="py-3 px-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                  Especialidad / Grupo
                </span>
              </TableHead>
              <TableHead className="py-3 px-4 w-[160px]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                  Empleados
                </span>
              </TableHead>
              <TableHead className="py-3 px-4 w-[120px] text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                  Estado
                </span>
              </TableHead>
              <TableHead className="py-3 px-4 w-[100px] text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                  Acciones
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-foreground-muted">
                  Cargando grupos...
                </TableCell>
              </TableRow>
            ) : filas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-16 text-center">
                  <span className="text-[13px] text-foreground-muted">
                    No hay grupos registrados en el sistema.
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              filas.map((grupo) => {
                const vinculados = vinculadosMap[grupo.id] ?? 0;
                return (
                  <TableRow
                    key={grupo.id}
                    className={`border-b border-[#f0f0f0] transition-colors ${
                      !grupo.activo
                        ? "bg-[#fafafa] hover:bg-[#f5f5f5]"
                        : "hover:bg-[#f7f9ff]"
                    }`}
                  >
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`size-7 rounded-[0.25rem] flex items-center justify-center shrink-0 ${
                            grupo.activo ? "bg-[#e8f0ff]" : "bg-[#f0f0f0]"
                          }`}
                        >
                          <Layers
                            className={`size-3.5 ${
                              grupo.activo ? "text-primary" : "text-[#aaaaaa]"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-[13px] font-bold ${
                            !grupo.activo
                              ? "text-[#aaaaaa] line-through"
                              : "text-foreground"
                          }`}
                        >
                          {grupo.tipoActividad}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="size-3.5 text-foreground-muted" />
                        <span className="text-[13px] text-foreground-muted">
                          {vinculados} vinculado{vinculados !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center">
                      {grupo.activo ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-success-soft rounded-full">
                          <div className="size-1.5 bg-success rounded-full" />
                          <span className="text-[11px] font-bold text-success">
                            Activo
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f0f0f0] rounded-full">
                          <div className="size-1.5 bg-foreground-muted rounded-full" />
                          <span className="text-[11px] font-bold text-foreground-muted">
                            Inactivo
                          </span>
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEdit(grupo)}
                          title="Editar grupo"
                          className="size-8 flex items-center justify-center rounded-[0.25rem] text-foreground-muted hover:text-primary hover:bg-[#e8f0ff] transition-colors cursor-pointer"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(grupo)}
                          disabled={!grupo.activo}
                          title="Dar de baja grupo"
                          className="size-8 flex items-center justify-center rounded-[0.25rem] text-foreground-muted hover:text-error hover:bg-[#fdf0f0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
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
