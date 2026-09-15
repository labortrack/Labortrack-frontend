import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
} from "@/shared/ui";
import { CheckCircle2, AlertTriangle, AlertCircle, X } from "lucide-react";
import type { GrupoResponseDto } from "../../types/estructuraLaboral.types";

interface ModificarGrupoDialogProps {
  grupo: GrupoResponseDto | null;
  empleadosVinculados: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActualizar: (id: number, denominacion: string) => Promise<void>;
  gruposExistentes: GrupoResponseDto[];
  isPending?: boolean;
}

function ModificarGrupoDialogContent({
  grupo,
  empleadosVinculados,
  open,
  onOpenChange,
  onActualizar,
  gruposExistentes,
  isPending,
}: ModificarGrupoDialogProps & { grupo: GrupoResponseDto }) {
  const [denominacion, setDenominacion] = useState(grupo.tipoActividad);
  const [error, setError] = useState<string | undefined>();
  const [showWarning, setShowWarning] = useState(false);

  const handleClose = () => {
    setError(undefined);
    setShowWarning(false);
    onOpenChange(false);
  };

  const handleClickActualizar = () => {
    const denom = denominacion.trim();
    if (!denom) {
      setError("La denominación de la actividad es un dato obligatorio.");
      return;
    }
    if (
      gruposExistentes.some(
        (g) =>
          g.id !== grupo.id &&
          g.tipoActividad.toLowerCase() === denom.toLowerCase()
      )
    ) {
      setError(
        "El grupo de especialización ingresado ya se encuentra registrado en el sistema."
      );
      return;
    }

    setError(undefined);
    if (empleadosVinculados > 0) {
      setShowWarning(true);
    } else {
      confirmar();
    }
  };

  const confirmar = async () => {
    try {
      await onActualizar(grupo.id, denominacion.trim());
      handleClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al actualizar el grupo.");
      setShowWarning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? handleClose() : null)}>
      <DialogContent className="max-w-md rounded-[0.5rem] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border bg-card">
          <div>
            <DialogTitle className="text-[20px] font-medium leading-6 text-foreground p-0 m-0">
              Modificar Grupo de Empleados
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-5 text-foreground-muted mt-1">
              Actualice la denominación de la especialidad o rama operativa.
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
        <div
          className={`px-6 py-6 transition-all ${
            showWarning ? "opacity-30 pointer-events-none select-none" : ""
          }`}
        >
          <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground mb-1.5">
            Denominación de la Especialidad{" "}
            <span className="text-accent-deep text-[12px] font-bold">*</span>
          </label>
          <Input
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

          {empleadosVinculados > 0 && !showWarning && (
            <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-[#fff8f0] border border-accent-deep/30 rounded-[0.25rem]">
              <AlertTriangle className="size-3.5 text-accent-deep shrink-0" />
              <span className="text-[13px] text-foreground-muted">
                Este grupo tiene{" "}
                <span className="font-bold text-accent-deep">
                  {empleadosVinculados} empleados
                </span>{" "}
                vinculados. Al guardar se solicitará confirmación.
              </span>
            </div>
          )}
        </div>

        {/* Bottom overlay warning if linked workers */}
        {showWarning && (
          <div className="bg-card border-t-2 border-accent-deep p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="size-9 bg-[#fff3e0] rounded-[0.5rem] flex items-center justify-center shrink-0">
                <AlertTriangle className="size-5 text-accent-deep" />
              </div>
              <div>
                <span className="text-[14px] font-bold text-foreground block mb-1">
                  Impacto en empleados vinculados
                </span>
                <span className="text-[13px] leading-5 text-foreground-muted block">
                  Atención: Esta modificación afectará el historial de{" "}
                  <span className="font-bold text-accent-deep">
                    {empleadosVinculados} empleados
                  </span>{" "}
                  actualmente vinculados a esta especialidad. ¿Desea continuar?
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setShowWarning(false)}
                className="h-9 px-5 rounded-[0.25rem] border-border text-foreground hover:bg-[#f0f0f0]"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmar}
                disabled={isPending}
                className="h-9 px-5 rounded-[0.25rem] bg-accent-deep hover:bg-accent-deep/90 text-white"
              >
                <CheckCircle2 className="size-4 mr-2" />
                {isPending ? "Actualizando..." : "Confirmar Modificación"}
              </Button>
            </div>
          </div>
        )}

        {/* Normal footer */}
        {!showWarning && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-[#f7f7f7]">
            <Button
              variant="outline"
              onClick={handleClose}
              className="h-9 px-5 rounded-[0.25rem] border-border text-foreground hover:bg-[#f0f0f0]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleClickActualizar}
              disabled={isPending}
              className="h-9 px-5 rounded-[0.25rem] bg-primary hover:bg-primary-hover text-white"
            >
              <CheckCircle2 className="size-4 mr-2" />
              {isPending ? "Actualizando..." : "Actualizar"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ModificarGrupoDialog(props: ModificarGrupoDialogProps) {
  if (!props.grupo || !props.open) return null;
  return (
    <ModificarGrupoDialogContent
      key={props.grupo.id}
      {...props}
      grupo={props.grupo}
    />
  );
}
