import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
} from "@/shared/ui";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import type { GrupoResponseDto } from "../../types/estructuraLaboral.types";

interface NuevoGrupoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuardar: (denominacion: string) => Promise<void>;
  gruposExistentes: GrupoResponseDto[];
  isPending?: boolean;
}

export function NuevoGrupoDialog({
  open,
  onOpenChange,
  onGuardar,
  gruposExistentes,
  isPending,
}: NuevoGrupoDialogProps) {
  const [denominacion, setDenominacion] = useState("");
  const [error, setError] = useState<string | undefined>();

  const handleClose = () => {
    setDenominacion("");
    setError(undefined);
    onOpenChange(false);
  };

  const handleGuardar = async () => {
    const denom = denominacion.trim();
    if (!denom) {
      setError("La denominación de la actividad es un dato obligatorio.");
      return;
    }
    if (
      gruposExistentes.some(
        (g) => g.tipoActividad.toLowerCase() === denom.toLowerCase()
      )
    ) {
      setError(
        "El grupo de especialización ingresado ya se encuentra registrado en el sistema."
      );
      return;
    }

    try {
      await onGuardar(denom);
      handleClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al registrar el grupo.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? handleClose() : null)}>
      <DialogContent className="max-w-md rounded-[0.5rem] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border bg-card">
          <div>
            <DialogTitle className="text-[20px] font-medium leading-6 text-foreground p-0 m-0">
              Registrar Nuevo Grupo de Empleados
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-5 text-foreground-muted mt-1">
              Defina la denominación única de la especialidad o rama operativa.
            </DialogDescription>
          </div>
          <button
            onClick={handleClose}
            className="size-8 flex items-center justify-center rounded-[0.25rem] text-foreground-muted hover:bg-[#f0f0f0] ml-4 shrink-0 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground mb-1.5">
            Denominación de la Especialidad{" "}
            <span className="text-accent-deep text-[12px] font-bold">*</span>
          </label>
          <Input
            placeholder="Ej: Hormigonado Estructural"
            value={denominacion}
            onChange={(e) => {
              setDenominacion(e.target.value);
              if (error) setError(undefined);
            }}
            className={`h-9 rounded-[0.25rem] text-[14px] ${
              error ? "border-error" : "border-border"
            }`}
          />
          {error && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <AlertCircle className="size-3.5 text-error shrink-0" />
              <span className="text-[11px] leading-[14px] text-error">
                {error}
              </span>
            </div>
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
            onClick={handleGuardar}
            disabled={isPending}
            className="h-9 px-5 rounded-[0.25rem] bg-primary hover:bg-primary-hover text-white"
          >
            <CheckCircle2 className="size-4 mr-2" />
            {isPending ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
