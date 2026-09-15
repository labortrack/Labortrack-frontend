import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from "@/shared/ui";
import { useBajaOperario } from "../../hooks/useCuadrillas";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { AlertTriangle, AlertCircle } from "lucide-react";
import type { EmpleadoGrupoCuadrillaResponseDto } from "../../types/cuadrilla.types";

interface DesvincularOperarioDialogProps {
  obraId: number;
  cuadrillaId: number;
  operario: EmpleadoGrupoCuadrillaResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DesvincularOperarioDialog({
  obraId,
  cuadrillaId,
  operario,
  open,
  onOpenChange,
}: DesvincularOperarioDialogProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const bajaOperarioMutation = useBajaOperario(cuadrillaId, obraId);

  const handleConfirm = async () => {
    if (!operario) return;
    setErrorMsg(null);

    try {
      await bajaOperarioMutation.mutateAsync({
        idEmpleadoGrupoCuadrilla: operario.id,
        payload: {
          cuadrillaId,
        },
      });
      onOpenChange(false);
    } catch (err) {
      setErrorMsg(
        normalizeApiError(err, "No se pudo desvincular al operario.").message
      );
    }
  };

  if (!operario) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle>Desvincular Operario</DialogTitle>
              <DialogDescription className="text-xs">
                Se dará de baja la asignación del trabajador a la cuadrilla.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3 text-sm">
          {errorMsg && (
            <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-md flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <p className="text-foreground">
            ¿Confirmas desvincular a{" "}
            <span className="font-bold">
              {operario.nombreEmpleado} {operario.apellidoEmpleado}
            </span>{" "}
            de esta cuadrilla?
          </p>

          <div className="rounded-lg bg-muted/60 p-3 border border-border text-xs text-muted-foreground">
            <p>
              Rol actual: <span className="font-semibold text-foreground">{operario.descripcionActividad}</span>
            </p>
            <p className="mt-1">
              El trabajador dejará de pertenecer a la cuadrilla y no se generarán nuevas asistencias para él en este equipo.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={bajaOperarioMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={bajaOperarioMutation.isPending}
          >
            {bajaOperarioMutation.isPending
              ? "Desvinculando..."
              : "Confirmar Desvinculación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
