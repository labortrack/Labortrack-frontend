import { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
} from "@/shared/ui";
import {
  SearchInput,
  InitialsAvatar,
  LoadingState,
  ErrorState,
} from "@/shared/components";
import {
  Users,
  Plus,
  Trash2,
  HardHat,
  Calendar,
  Crown,
} from "lucide-react";
import { HistorialAuditoriaIconButton } from "@/features/auditoria";
import type {
  CuadrillaResponseDto,
  EmpleadoGrupoCuadrillaResponseDto,
} from "../types/cuadrilla.types";
import { normalizeSearchText } from "@/shared/utils/normalizeText";
import { agruparNominaPorEmpleado } from "../utils/nomina";

interface CuadrillaNominaTableProps {
  cuadrilla: CuadrillaResponseDto;
  operarios: EmpleadoGrupoCuadrillaResponseDto[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onAsignarOperario: () => void;
  onDesvincularOperario: (operario: EmpleadoGrupoCuadrillaResponseDto) => void;
  onAbrirHistorial?: (operario: EmpleadoGrupoCuadrillaResponseDto) => void;
  readOnly?: boolean;
  embedded?: boolean;
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
}

export function CuadrillaNominaTable({
  cuadrilla,
  operarios,
  isLoading,
  isError,
  onRetry,
  onAsignarOperario,
  onDesvincularOperario,
  onAbrirHistorial,
  readOnly = false,
  embedded = false,
  searchTerm: controlledSearchTerm,
  onSearchTermChange,
}: CuadrillaNominaTableProps) {
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const searchTerm = controlledSearchTerm ?? internalSearchTerm;
  const setSearchTerm = onSearchTermChange ?? setInternalSearchTerm;

  const integrantes = agruparNominaPorEmpleado(operarios, cuadrilla);

  const filteredOperarios = integrantes.filter((integrante) => {
    const term = normalizeSearchText(searchTerm);
    if (!term) return true;
    const fullName = normalizeSearchText(
      `${integrante.nombreEmpleado || ""} ${integrante.apellidoEmpleado || ""}`,
    );
    const roles = normalizeSearchText(
      [
        ...integrante.asignaciones.map((asig) => asig.descripcionActividad),
        integrante.asignacionLider ? "Líder de cuadrilla" : "",
      ].join(" "),
    );
    return fullName.includes(term) || roles.includes(term);
  });

  const isSuspended = cuadrilla.estadoActual === "SUSPENDIDA";
  const isFinalizada = cuadrilla.estadoActual === "FINALIZADA";

  const tableContent = (
    <CardContent className="p-0">
      {isLoading ? (
        <div className="p-12">
          <LoadingState label="Cargando nómina de la cuadrilla..." />
        </div>
      ) : isError ? (
        <div className="p-8">
          <ErrorState
            message="No se pudo cargar la nómina de operarios de esta cuadrilla."
            onRetry={onRetry}
          />
        </div>
      ) : filteredOperarios.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <HardHat className="size-6 text-muted-foreground/60" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="text-sm font-semibold text-foreground">
              {searchTerm
                ? "No se encontraron operarios con ese criterio"
                : "Cuadrilla sin operarios asignados"}
            </p>
            <p className="text-xs text-muted-foreground">
              {searchTerm
                ? "Intenta buscar con otro término o borra el filtro."
                : "Incorpora trabajadores para conformar el equipo de trabajo de esta cuadrilla."}
            </p>
          </div>
          {!readOnly && !searchTerm && !isSuspended && !isFinalizada && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAsignarOperario}
              className="mt-2 text-xs"
            >
              <Plus className="size-3.5 mr-1.5" />
              Asignar Primer Operario
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[35%] text-xs font-semibold uppercase tracking-wider">
                  Trabajador
                </TableHead>
                <TableHead className="w-[25%] text-xs font-semibold uppercase tracking-wider">
                  Rol en Cuadrilla
                </TableHead>
                <TableHead className="w-[25%] text-xs font-semibold uppercase tracking-wider">
                  Vigencia de Asignación
                </TableHead>
                {!readOnly ? (
                  <TableHead className="w-[15%] text-right text-xs font-semibold uppercase tracking-wider">
                    Acciones
                  </TableHead>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOperarios.map((integrante) => {
                const op = integrante.principal;
                const lider = integrante.asignacionLider;
                return (
                <TableRow
                  key={integrante.empleadoId}
                  className="group hover:bg-muted/40 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <InitialsAvatar
                        name={`${op.nombreEmpleado} ${op.apellidoEmpleado}`}
                        size="md"
                        className="size-8 text-xs shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {op.apellidoEmpleado}, {op.nombreEmpleado}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          Legajo ID #{op.empleadoId}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {integrante.asignaciones.map((asig) => (
                        <div key={asig.id} className="flex items-center gap-1.5 text-xs text-foreground">
                          <HardHat className="size-3.5 text-primary shrink-0" />
                          <span className="font-medium truncate">
                            {asig.descripcionActividad || "Operario"}
                          </span>
                        </div>
                      ))}
                      {lider && (
                        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                          <Crown className="size-3 shrink-0" />
                          Líder de cuadrilla
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      {integrante.asignaciones.map((asig) => (
                        <div key={asig.id} className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-muted-foreground/70 shrink-0" />
                          <span>
                            {asig.fechaVigenciaDesde}
                            {asig.fechaVigenciaHasta
                              ? ` hasta ${asig.fechaVigenciaHasta}`
                              : " (Indefinida)"}
                          </span>
                        </div>
                      ))}
                      {lider && (
                        <div className="flex items-center gap-1.5">
                          <Crown className="size-3.5 text-muted-foreground/70 shrink-0" />
                          <span>Líder desde {lider.fechaVigenciaDesde}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {!readOnly ? (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onAbrirHistorial && (
                          <HistorialAuditoriaIconButton
                            onAbrir={() => onAbrirHistorial(op)}
                            label={`Historial de ${op.apellidoEmpleado}, ${op.nombreEmpleado}`}
                          />
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="size-8 p-0 text-error hover:bg-error-soft hover:text-error-strong"
                          title={
                            lider
                              ? "Es el líder: designe a otro líder antes de desvincularlo"
                              : "Desvincular de la cuadrilla"
                          }
                          onClick={() => onDesvincularOperario(op)}
                          disabled={isSuspended || isFinalizada || Boolean(lider)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  ) : onAbrirHistorial ? (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <HistorialAuditoriaIconButton
                          onAbrir={() => onAbrirHistorial(op)}
                          label={`Historial de ${op.apellidoEmpleado}, ${op.nombreEmpleado}`}
                        />
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </CardContent>
  );

  if (embedded) return tableContent;

  return (
    <Card className="border border-border bg-card shadow-sm overflow-hidden">
      <CardHeader className="p-4 sm:p-6 border-b border-border/60 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  Nómina Operativa de Cuadrilla
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {integrantes.length} operario{integrantes.length !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Personal asignado a <span className="font-semibold text-foreground">{cuadrilla.nombre}</span> ({cuadrilla.grupo?.tipoActividad || "General"})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-full sm:w-60">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o rol..."
                className="h-9 text-xs"
              />
            </div>

            {!readOnly ? (
              <Button
                type="button"
                onClick={onAsignarOperario}
                disabled={isSuspended || isFinalizada}
                className="gap-1.5 h-9 shrink-0 text-xs font-semibold"
              >
                <Plus className="size-4" />
                <span>Incorporar Operario</span>
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>
      {tableContent}
    </Card>
  );
}

