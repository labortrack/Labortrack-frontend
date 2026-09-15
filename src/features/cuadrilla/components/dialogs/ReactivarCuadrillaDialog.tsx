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
import { useReactivarCuadrilla } from "../../hooks/useCuadrillas";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { RotateCcw, AlertCircle } from "lucide-react";
import type { CuadrillaResponseDto } from "../../types/cuadrilla.types";

interface ReactivarCuadrillaDialogProps {
  obraId: number;
  cuadrilla: CuadrillaResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ReactivarCuadrillaDialog({
  obraId,
  cuadrilla,
  open,
  onOpenChange,
  onSuccess,
}: ReactivarCuadrillaDialogProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const reactivarMutation = useReactivarCuadrilla(obraId);

  const handleConfirm = async () => {
    if (!cuadrilla) return;
    setErrorMsg(null);

    try {
      await reactivarMutation.mutateAsync(cuadrilla.id);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setErrorMsg(
        normalizeApiError(err, "No se pudo reactivar la cuadrilla.").message
      );
    }
  };

  if (!cuadrilla) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <RotateCcw className="size-5" />
            </div>
            <div>
              <DialogTitle>Reactivar Cuadrilla</DialogTitle>
              <DialogDescription className="text-xs">
                Restablece el frente operativo de la cuadrilla.
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
            ¿Deseas reactivar la cuadrilla{" "}
            <span className="font-bold text-foreground">{cuadrilla.nombre}</span>?
          </p>

          <div className="rounded-lg bg-muted/60 p-3.5 border border-border text-xs space-y-2 text-muted-foreground">
            <p className="font-semibold text-foreground">
              Comportamiento de la reactivación:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                La cuadrilla pasará a estado <strong>PLANIFICADA</strong>.
              </li>
              <li>
                Se anulará la marca de baja y quedará disponible para volver a incorporar operarios y planificarle nuevos planes de trabajo.
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={reactivarMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleConfirm}
            disabled={reactivarMutation.isPending}
          >
            {reactivarMutation.isPending ? "Reactivando..." : "Confirmar Reactivación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
