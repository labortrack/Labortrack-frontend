import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Button,
} from "@/shared/ui";
import { Trash2, ShieldAlert, AlertTriangle } from "lucide-react";
import type { GrupoResponseDto } from "../../types/estructuraLaboral.types";

interface BajaGrupoDialogProps {
  grupo: GrupoResponseDto | null;
  empleadosVinculados: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmarBaja: (id: number) => Promise<void>;
  isPending?: boolean;
}

export function BajaGrupoDialog({
  grupo,
  empleadosVinculados,
  open,
  onOpenChange,
  onConfirmarBaja,
  isPending,
}: BajaGrupoDialogProps) {
  const tieneHistorial = empleadosVinculados > 0;

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleConfirmar = async () => {
    if (!grupo || tieneHistorial) return;
    await onConfirmarBaja(grupo.id);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? handleClose() : null)}>
      <DialogContent
        className="max-w-md rounded-[0.5rem] p-0 gap-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="flex items-start gap-4 px-6 pt-6 pb-4">
          <div
            className={`size-12 rounded-[0.5rem] flex items-center justify-center shrink-0 ${
              tieneHistorial ? "bg-[#fff3e0]" : "bg-[#fdf0f0]"
            }`}
          >
            {tieneHistorial ? (
              <ShieldAlert className="size-6 text-accent-deep" />
            ) : (
              <Trash2 className="size-6 text-error" />
            )}
          </div>
          <div className="flex-1">
            <DialogTitle className="text-[18px] font-medium leading-6 text-foreground p-0 m-0 mb-1">
              {tieneHistorial
                ? "No es posible dar de baja este grupo"
                : "¿Dar de baja este grupo?"}
            </DialogTitle>
            {grupo && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f0f0f0] rounded-[0.25rem] mt-1 text-[11px] font-bold text-foreground-muted">
                <div className="size-1.5 bg-foreground-muted rounded-full" />
                {grupo.tipoActividad}
              </span>
            )}
          </div>
        </div>

        <div className="px-6 pb-5">
          {tieneHistorial ? (
            <div className="space-y-3">
              <DialogDescription className="text-[13px] leading-5 text-foreground-muted">
                No es posible eliminar el Grupo de Empleados porque cuenta con{" "}
                <span className="font-bold text-accent-deep">
                  {empleadosVinculados} registros históricos
                </span>{" "}
                de personal asociados. Considere desvincular a los empleados de
                este grupo antes de proceder.
              </DialogDescription>
              <div className="flex items-start gap-3 px-4 py-3 bg-[#fff8f0] border border-accent-deep/30 rounded-[0.5rem]">
                <AlertTriangle className="size-4 text-accent-deep shrink-0 mt-0.5" />
                <span className="text-[13px] text-foreground">
                  Acceda a la sección{" "}
                  <span className="font-bold">Asignación de Empleados</span> y
                  finalice las vinculaciones activas antes de intentar esta
                  acción.
                </span>
              </div>
            </div>
          ) : (
            <DialogDescription className="text-[13px] leading-5 text-foreground-muted">
              ¿Está seguro de que desea dar de baja este grupo? Ya no estará
              disponible para nuevas asignaciones.
            </DialogDescription>
          )}
        </div>

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
            disabled={tieneHistorial || isPending}
            className={`h-9 px-5 rounded-[0.25rem] text-white ${
              tieneHistorial
                ? "bg-[#c2c2c2] cursor-not-allowed opacity-50"
                : "bg-error hover:bg-error-strong"
            }`}
          >
            <Trash2 className="size-4 mr-2" />
            {isPending ? "Eliminando..." : "Confirmar Baja"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
