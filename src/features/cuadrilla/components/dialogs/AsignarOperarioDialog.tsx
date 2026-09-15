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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui";
import { useAsignarOperario } from "../../hooks/useCuadrillas";
import { useEmpleadosPorGrupo } from "@/features/estructuraLaboral/hooks/useEstructuraLaboral";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { Users, AlertCircle } from "lucide-react";
import type { CuadrillaResponseDto } from "../../types/cuadrilla.types";

interface AsignarOperarioDialogProps {
  obraId: number;
  cuadrilla: CuadrillaResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getInitialDates() {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  return { today, nextMonth };
}

export function AsignarOperarioDialog({
  obraId,
  cuadrilla,
  open,
  onOpenChange,
}: AsignarOperarioDialogProps) {
  const [empleadoGrupoId, setEmpleadoGrupoId] = useState<string>("");
  const [descripcionActividad, setDescripcionActividad] = useState<string>("");
  const [fechaDesde, setFechaDesde] = useState<string>(() => getInitialDates().today);
  const [fechaHasta, setFechaHasta] = useState<string>(() => getInitialDates().nextMonth);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const asignarMutation = useAsignarOperario(cuadrilla?.id ?? 0, obraId);

  // Consultar operarios activos vinculados a la especialidad/grupo de la cuadrilla
  const { data: operariosGrupoData, isLoading: isLoadingOperarios } =
    useEmpleadosPorGrupo(cuadrilla?.grupo?.id, { activo: true });

  const asignacionesDisponibles = operariosGrupoData?.content ?? [];
  const liderId = cuadrilla?.lider?.idEmpleado;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuadrilla) return;
    setErrorMsg(null);

    if (!empleadoGrupoId.trim()) {
      setErrorMsg("Debes seleccionar un operario de la especialidad.");
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

            {asignacionesDisponibles.length === 0 && !isLoadingOperarios && (
              <div className="rounded-lg bg-amber-500/10 p-3 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
                <span>
                  No hay operarios activos asignados a la especialidad{" "}
                  <strong>{cuadrilla.grupo?.tipoActividad}</strong>. Puedes
                  asignar trabajadores en el módulo de Estructura Laboral.
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="empleadoGrupoId" className="text-xs font-semibold">
                Operario de la Especialidad *
              </Label>
              <Select
                value={empleadoGrupoId}
                onValueChange={setEmpleadoGrupoId}
                disabled={
                  asignarMutation.isPending ||
                  isLoadingOperarios ||
                  asignacionesDisponibles.length === 0
                }
              >
                <SelectTrigger id="empleadoGrupoId" className="text-sm">
                  <SelectValue
                    placeholder={
                      isLoadingOperarios
                        ? "Cargando operarios de la especialidad..."
                        : asignacionesDisponibles.length === 0
                        ? "Sin operarios disponibles en este grupo"
                        : "Seleccionar operario"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {asignacionesDisponibles.map((asig) => {
                    const esLider = liderId != null && asig.empleadoId === liderId;
                    return (
                      <SelectItem
                        key={asig.id}
                        value={String(asig.id)}
                        disabled={esLider}
                      >
                        {asig.apellidoEmpleado}, {asig.nombreEmpleado}
                        {asig.dniEmpleado
                          ? ` (DNI: ${asig.dniEmpleado})`
                          : ` (Legajo #${asig.empleadoId})`}
                        {esLider ? " — Líder actual" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Muestra los trabajadores con asignación activa a la especialidad {cuadrilla.grupo?.tipoActividad}.
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
