import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui";
import { useAsignarLider, useOperariosCuadrilla } from "../../hooks/useCuadrillas";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { HardHat, AlertCircle, AlertTriangle } from "lucide-react";
import type { CuadrillaResponseDto } from "../../types/cuadrilla.types";
import { agruparNominaPorEmpleado } from "../../utils/nomina";

interface AsignarLiderDialogProps {
  obraId: number;
  cuadrilla: CuadrillaResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AsignarLiderDialog({
  obraId,
  cuadrilla,
  open,
  onOpenChange,
}: AsignarLiderDialogProps) {
  const [empleadoId, setEmpleadoId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Con un líder vigente, el primer envío solo muestra la advertencia de reemplazo.
  const [confirmandoReemplazo, setConfirmandoReemplazo] = useState(false);

  const asignarLiderMutation = useAsignarLider(obraId);

  // El líder se elige entre los integrantes de la cuadrilla.
  const { data: nominaData, isLoading: isLoadingOperarios } =
    useOperariosCuadrilla(open ? cuadrilla?.id : null);

  const operariosGrupo = cuadrilla
    ? agruparNominaPorEmpleado(nominaData ?? [], cuadrilla).filter(
        (integrante) => integrante.asignaciones.length > 0,
      )
    : [];

  const nuevoLider = operariosGrupo.find(
    (integrante) => String(integrante.empleadoId) === empleadoId,
  );

  const cerrar = (nextOpen: boolean) => {
    if (!nextOpen) {
      setEmpleadoId("");
      setErrorMsg(null);
      setConfirmandoReemplazo(false);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuadrilla) return;
    setErrorMsg(null);

    if (!empleadoId) {
      setErrorMsg("Debes seleccionar un empleado para designar como líder.");
      return;
    }

    if (cuadrilla.lider && !confirmandoReemplazo) {
      setConfirmandoReemplazo(true);
      return;
    }

    try {
      await asignarLiderMutation.mutateAsync({
        cuadrillaId: cuadrilla.id,
        empleadoId: Number(empleadoId),
        confirmarReemplazo: Boolean(cuadrilla.lider),
      });
      cerrar(false);
    } catch (err) {
      setErrorMsg(
        normalizeApiError(err, "No se pudo asignar el líder a la cuadrilla.")
          .message
      );
    }
  };

  if (!cuadrilla) return null;

  return (
    <Dialog open={open} onOpenChange={cerrar}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <HardHat className="size-5" />
              </div>
              <div>
                <DialogTitle>
                  {cuadrilla.lider ? "Cambiar Líder" : "Designar Líder de Cuadrilla"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Cuadrilla: {cuadrilla.nombre} ({cuadrilla.grupo?.tipoActividad || "General"})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {errorMsg && (
              <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-md flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {cuadrilla.lider && (
              <div className="rounded-lg bg-muted/60 p-3 border border-border text-xs text-muted-foreground">
                <span>Líder actual: </span>
                <span className="font-semibold text-foreground">
                  {cuadrilla.lider.nombre} {cuadrilla.lider.apellido} ({cuadrilla.lider.email})
                </span>
              </div>
            )}

            {operariosGrupo.length === 0 && !isLoadingOperarios && (
              <div className="rounded-lg bg-amber-500/10 p-3 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
                <span>
                  La cuadrilla no tiene integrantes. Para designar un líder,
                  primero incorpora al trabajador a la nómina de la cuadrilla.
                </span>
              </div>
            )}

            {confirmandoReemplazo && cuadrilla.lider && nuevoLider && (
              <div
                role="alert"
                className="rounded-lg bg-amber-500/10 p-3 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex gap-2"
              >
                <AlertTriangle className="size-4 shrink-0" />
                <span>
                  <strong>
                    {cuadrilla.lider.nombre} {cuadrilla.lider.apellido}
                  </strong>{" "}
                  dejará de ser líder de la cuadrilla y seguirá como integrante.
                  El nuevo líder será{" "}
                  <strong>
                    {nuevoLider.nombreEmpleado} {nuevoLider.apellidoEmpleado}
                  </strong>
                  . ¿Confirmas el reemplazo?
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="empleado-lider" className="text-xs font-semibold">
                Seleccionar Nuevo Líder *
              </Label>
              <Select
                value={empleadoId}
                onValueChange={(value) => {
                  setEmpleadoId(value);
                  setConfirmandoReemplazo(false);
                }}
                disabled={
                  asignarLiderMutation.isPending ||
                  isLoadingOperarios ||
                  operariosGrupo.length === 0
                }
              >
                <SelectTrigger id="empleado-lider" className="text-sm">
                  <SelectValue
                    placeholder={
                      isLoadingOperarios
                        ? "Cargando integrantes de la cuadrilla..."
                        : operariosGrupo.length === 0
                        ? "Sin integrantes en la cuadrilla"
                        : "Seleccionar integrante"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {operariosGrupo.map((integrante) => {
                    const esLiderActual =
                      cuadrilla.lider != null &&
                      cuadrilla.lider.idEmpleado === integrante.empleadoId;
                    return (
                      <SelectItem
                        key={integrante.empleadoId}
                        value={String(integrante.empleadoId)}
                        disabled={esLiderActual}
                      >
                        {integrante.apellidoEmpleado}, {integrante.nombreEmpleado}
                        {` (Legajo #${integrante.empleadoId})`}
                        {esLiderActual ? " — Líder actual" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1">
                Debe ser integrante de la cuadrilla y pertenecer al grupo "Líder de Cuadrilla" en Estructura Laboral.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => cerrar(false)}
              disabled={asignarLiderMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                asignarLiderMutation.isPending ||
                operariosGrupo.length === 0 ||
                !empleadoId
              }
            >
              {asignarLiderMutation.isPending
                ? "Guardando..."
                : confirmandoReemplazo
                ? "Confirmar reemplazo"
                : cuadrilla.lider
                ? "Reemplazar Líder"
                : "Confirmar Líder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
