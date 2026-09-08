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
import { useBajaCuadrilla } from "../../hooks/useCuadrillas";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { AlertTriangle, AlertCircle } from "lucide-react";
import type { CuadrillaResponseDto } from "../../types/cuadrilla.types";

interface BajaCuadrillaDialogProps {
  obraId: number;
  cuadrilla: CuadrillaResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BajaCuadrillaDialog({
  obraId,
  cuadrilla,
  open,
  onOpenChange,
  onSuccess,
}: BajaCuadrillaDialogProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const bajaMutation = useBajaCuadrilla(obraId);

  const handleConfirm = async () => {
    if (!cuadrilla) return;
    setErrorMsg(null);

    try {
      await bajaMutation.mutateAsync(cuadrilla.id);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setErrorMsg(
        normalizeApiError(err, "No se pudo dar de baja la cuadrilla.").message
      );
    }
  };

  if (!cuadrilla) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle>Dar de Baja Cuadrilla</DialogTitle>
              <DialogDescription className="text-xs">
                Acción definitiva sobre el frente operativo.
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
            ¿Estás seguro de que deseas dar de baja a la cuadrilla{" "}
            <span className="font-bold text-foreground">{cuadrilla.nombre}</span>?
          </p>

          <div className="rounded-lg bg-muted/60 p-3.5 border border-border text-xs space-y-2 text-muted-foreground">
            <p className="font-semibold text-foreground">
              Efectos colaterales del proceso:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                La cuadrilla pasará a estado <strong>SUSPENDIDA</strong>.
              </li>
              <li>
                Se desvincularán los <strong>{cuadrilla.operariosCount ?? 0} operarios</strong> asignados.
              </li>
              <li>
                Se anularán las jornadas programadas y se cancelarán los planes futuros.
              </li>
              <li className="text-amber-600 dark:text-amber-400 font-medium">
                Si existen operarios con asistencia abierta (Presentes hoy), el sistema rechazará la baja hasta que registren su egreso.
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={bajaMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={bajaMutation.isPending}
          >
            {bajaMutation.isPending ? "Dando de baja..." : "Confirmar Baja"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
