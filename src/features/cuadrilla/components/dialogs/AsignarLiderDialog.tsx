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
import { useAsignarLider } from "../../hooks/useCuadrillas";
import { legajosApi } from "@/features/legajos/api/legajosApi";
import { useQuery } from "@tanstack/react-query";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { HardHat, AlertCircle } from "lucide-react";
import type { CuadrillaResponseDto } from "../../types/cuadrilla.types";

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

  const asignarLiderMutation = useAsignarLider(obraId);

  // Consultar empleados activos de la empresa para seleccionar líder
  const { data: empleadosData, isLoading: isLoadingEmpleados } = useQuery({
    queryKey: ["empleados", "activos", "select"],
    queryFn: () => legajosApi.getPaginados({ page: 0, size: 50 }),
    enabled: open,
  });

  const empleados = empleadosData?.content ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuadrilla) return;
    setErrorMsg(null);

    if (!empleadoId) {
      setErrorMsg("Debes seleccionar un empleado para designar como líder.");
      return;
    }

    try {
      await asignarLiderMutation.mutateAsync({
        cuadrillaId: cuadrilla.id,
        empleadoId: Number(empleadoId),
      });
      setEmpleadoId("");
      onOpenChange(false);
    } catch (err) {
      setErrorMsg(
        normalizeApiError(err, "No se pudo asignar el líder a la cuadrilla.")
          .message
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

            <div className="space-y-1.5">
              <Label htmlFor="empleado-lider" className="text-xs font-semibold">
                Seleccionar Nuevo Líder *
              </Label>
              <Select
                value={empleadoId}
                onValueChange={setEmpleadoId}
                disabled={asignarLiderMutation.isPending || isLoadingEmpleados}
              >
                <SelectTrigger id="empleado-lider" className="text-sm">
                  <SelectValue
                    placeholder={
                      isLoadingEmpleados
                        ? "Cargando trabajadores..."
                        : "Seleccionar empleado"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {empleados.map((emp) => (
                    <SelectItem key={emp.id} value={String(emp.id)}>
                      {emp.apellido}, {emp.nombre} — Legajo #{emp.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1">
                El empleado debe tener vinculación activa con la especialidad ({cuadrilla.grupo?.tipoActividad}) de la cuadrilla.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={asignarLiderMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={asignarLiderMutation.isPending}
            >
              {asignarLiderMutation.isPending
                ? "Guardando..."
                : "Confirmar Líder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
