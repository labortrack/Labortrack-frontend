import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Button,
} from "@/shared/ui";
import { InitialsAvatar } from "@/shared/components/InitialsAvatar";
import { CalendarClock, XCircle, AlertTriangle, Link2Off } from "lucide-react";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import type { EmpleadoGrupoResponseDto } from "../../types/estructuraLaboral.types";

interface FinalizarAsignacionDialogProps {
  asig: EmpleadoGrupoResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmarFinalizar: (asig: EmpleadoGrupoResponseDto) => Promise<void>;
  isPending?: boolean;
}

export function FinalizarAsignacionDialog({
  asig,
  open,
  onOpenChange,
  onConfirmarFinalizar,
  isPending,
}: FinalizarAsignacionDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = () => {
    setErrorMessage(null);
    onOpenChange(false);
  };

  const handleConfirmar = async () => {
    if (!asig) return;
    try {
      setErrorMessage(null);
      await onConfirmarFinalizar(asig);
      handleClose();
    } catch (err) {
      const normalized = normalizeApiError(
        err,
        "No se pudo finalizar la asignación del empleado."
      );
      setErrorMessage(normalized.message);
    }
  };

  const nombreCompleto = asig
    ? `${asig.apellidoEmpleado}, ${asig.nombreEmpleado}`
    : "";

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? handleClose() : null)}>
      <DialogContent
        className="max-w-md rounded-[0.5rem] p-0 gap-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 px-6 pt-6 pb-4">
          <div
            className={`size-12 rounded-[0.5rem] flex items-center justify-center shrink-0 ${
              errorMessage ? "bg-[#fdf0f0]" : "bg-[#fff3e0]"
            }`}
          >
            {errorMessage ? (
              <XCircle className="size-6 text-error" />
            ) : (
              <CalendarClock className="size-6 text-accent-deep" />
            )}
          </div>
          <div className="flex-1">
            <DialogTitle className="text-[18px] font-medium leading-6 text-foreground p-0 m-0 mb-1">
              {errorMessage
                ? "No es posible finalizar esta asignación"
                : "Finalizar Asignación de Especialidad"}
            </DialogTitle>
            {asig && (
              <div className="flex items-center gap-2 mt-1">
                <InitialsAvatar name={nombreCompleto} size="sm" />
                <div>
                  <span className="text-[13px] font-bold text-foreground block">
                    {nombreCompleto}
                  </span>
                  <span className="text-[12px] text-foreground-muted block">
                    {asig.tipoActividad}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-5 space-y-4">
          {errorMessage ? (
            <div className="flex items-start gap-3 px-4 py-4 bg-[#fdf0f0] border border-error rounded-[0.5rem]">
              <XCircle className="size-5 text-error shrink-0 mt-0.5" />
              <div>
                <span className="text-[13px] font-bold text-error block mb-1">
                  Finalización bloqueada
                </span>
                <span className="text-[13px] leading-5 text-foreground block">
                  {errorMessage}
                </span>
              </div>
            </div>
          ) : (
            <>
              <DialogDescription className="text-[13px] leading-5 text-foreground-muted">
                Esta acción cerrará la vinculación activa del empleado con la
                especialidad. El registro histórico se conservará. La fecha de
                fin se registrará automáticamente como la fecha actual.
              </DialogDescription>
              <div className="flex items-center gap-2 px-4 py-3 bg-[#fff8f0] border border-accent-deep/30 rounded-[0.5rem]">
                <AlertTriangle className="size-4 text-accent-deep shrink-0" />
                <span className="text-[13px] text-foreground-muted">
                  Esta acción no puede deshacerse. El empleado podrá ser
                  reasignado a una nueva especialidad posteriormente.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-[#f7f7f7]">
          <Button
            variant="outline"
            onClick={handleClose}
            className="h-9 px-5 rounded-[0.25rem] border-border text-foreground hover:bg-[#f0f0f0]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={isPending || !!errorMessage}
            className="h-9 px-5 rounded-[0.25rem] text-white bg-accent-deep hover:bg-accent-deep/90 disabled:opacity-50"
          >
            <Link2Off className="size-4 mr-2" />
            {isPending ? "Finalizando..." : "Confirmar Baja"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
