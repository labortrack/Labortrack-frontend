import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
} from "@/shared/ui";
import { useAsignarOperario } from "../../hooks/useCuadrillas";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { Users, AlertCircle } from "lucide-react";
import type { CuadrillaResponseDto } from "../../types/cuadrilla.types";

interface AsignarOperarioDialogProps {
  obraId: number;
  cuadrilla: CuadrillaResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AsignarOperarioDialog({
  obraId,
  cuadrilla,
  open,
  onOpenChange,
}: AsignarOperarioDialogProps) {
  const today = new Date().toISOString().split("T")[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [empleadoGrupoId, setEmpleadoGrupoId] = useState<string>("");
  const [descripcionActividad, setDescripcionActividad] = useState<string>("");
  const [fechaDesde, setFechaDesde] = useState<string>(today);
  const [fechaHasta, setFechaHasta] = useState<string>(nextMonth);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const asignarMutation = useAsignarOperario(cuadrilla?.id ?? 0, obraId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuadrilla) return;
    setErrorMsg(null);

    if (!empleadoGrupoId.trim()) {
      setErrorMsg("Debes ingresar el ID de asignación de grupo del empleado (empleadoGrupoId).");
      return;
    }
    if (!descripcionActividad.trim()) {
      setErrorMsg("Debe especificar la actividad o rol del operario.");
      return;
    }
    if (!fechaDesde) {
      setErrorMsg("La fecha de inicio es requerida.");
      return;
    }
    if (!fechaHasta) {
      setErrorMsg("La fecha de finalización es requerida.");
      return;
    }
    if (fechaHasta < fechaDesde) {
      setErrorMsg("La fecha de fin debe ser igual o posterior a la fecha de inicio.");
      return;
    }

    try {
      await asignarMutation.mutateAsync({
        empleadoGrupoId: Number(empleadoGrupoId),
        cuadrillaId: cuadrilla.id,
        descripcionActividad: descripcionActividad.trim(),
        fechaVigenciaDesde: fechaDesde,
        fechaVigenciaHasta: fechaHasta,
      });

      setEmpleadoGrupoId("");
      setDescripcionActividad("");
      onOpenChange(false);
    } catch (err) {
      setErrorMsg(
        normalizeApiError(err, "No se pudo incorporar el operario a la cuadrilla.").message
      );
    }
  };

  if (!cuadrilla) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="size-5" />
              </div>
              <div>
                <DialogTitle>Incorporar Operario</DialogTitle>
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

            <div className="space-y-1.5">
              <Label htmlFor="empleadoGrupoId" className="text-xs font-semibold">
                ID de Asignación Empleado-Grupo (empleadoGrupoId) *
              </Label>
              <Input
                id="empleadoGrupoId"
                type="number"
                placeholder="Ej. 1"
                value={empleadoGrupoId}
                onChange={(e) => setEmpleadoGrupoId(e.target.value)}
                disabled={asignarMutation.isPending}
                className="text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Corresponde a la vinculación activa del empleado con la especialidad {cuadrilla.grupo?.tipoActividad}.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="actividad" className="text-xs font-semibold">
                Rol / Tarea en Cuadrilla *
              </Label>
              <Input
                id="actividad"
                placeholder="Ej. Oficial Albañil, Ayudante, Armador"
                value={descripcionActividad}
                onChange={(e) => setDescripcionActividad(e.target.value)}
                disabled={asignarMutation.isPending}
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="desde" className="text-xs font-semibold">
                  Vigencia Desde *
                </Label>
                <Input
                  id="desde"
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  disabled={asignarMutation.isPending}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hasta" className="text-xs font-semibold">
                  Vigencia Hasta *
                </Label>
                <Input
                  id="hasta"
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  disabled={asignarMutation.isPending}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={asignarMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={asignarMutation.isPending}>
              {asignarMutation.isPending ? "Asignando..." : "Incorporar Operario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
