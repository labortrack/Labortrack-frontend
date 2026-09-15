import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui";
import { Link2, XCircle, X } from "lucide-react";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import type { GrupoResponseDto } from "../../types/estructuraLaboral.types";
import type { EmpleadoResumenResponseDto } from "@/features/legajos/types/legajo.types";

interface NuevaAsignacionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAsignar: (empleadoId: number, grupoId: number) => Promise<void>;
  grupos: GrupoResponseDto[];
  empleados: EmpleadoResumenResponseDto[];
  isPending?: boolean;
}

export function NuevaAsignacionDialog({
  open,
  onOpenChange,
  onAsignar,
  grupos,
  empleados,
  isPending,
}: NuevaAsignacionDialogProps) {
  const [empleadoId, setEmpleadoId] = useState("");
  const [grupoId, setGrupoId] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fechaInicio = new Date().toISOString().split("T")[0];

  const handleClose = () => {
    setEmpleadoId("");
    setGrupoId("");
    setErrorMessage(null);
    onOpenChange(false);
  };

  const handleGuardar = async () => {
    if (!empleadoId || !grupoId) return;

    try {
      setErrorMessage(null);
      await onAsignar(parseInt(empleadoId), parseInt(grupoId));
      handleClose();
    } catch (err) {
      const normalized = normalizeApiError(
        err,
        "No se pudo completar la asignación del empleado."
      );
      setErrorMessage(normalized.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? handleClose() : null)}>
      <DialogContent className="max-w-lg rounded-[0.5rem] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border bg-card">
          <div>
            <DialogTitle className="text-[20px] font-medium leading-6 text-foreground p-0 m-0">
              Nueva Asignación de Especialidad
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-5 text-foreground-muted mt-1">
              Vincule un empleado activo a un grupo de especialidad operativa.
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
        <div className="px-6 py-6 space-y-5">
          {/* Operario */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground mb-1.5">
              Empleado / Operario{" "}
              <span className="text-accent-deep text-[12px] font-bold">*</span>
            </label>
            <Select
              value={empleadoId}
              onValueChange={(v) => {
                setEmpleadoId(v);
                setErrorMessage(null);
              }}
            >
              <SelectTrigger className="h-9 rounded-[0.25rem] text-[14px] border-border bg-card">
                <SelectValue placeholder="Buscar y seleccionar empleado..." />
              </SelectTrigger>
              <SelectContent>
                {empleados.map((emp) => {
                  const isInactivo = emp.estadoActual !== "ACTIVO";
                  return (
                    <SelectItem
                      key={emp.id}
                      value={String(emp.id)}
                      disabled={isInactivo}
                      className={`text-[13px] ${
                        isInactivo ? "text-[#aaaaaa]" : ""
                      }`}
                    >
                      {emp.apellido}, {emp.nombre} — DNI {emp.dni}
                      {isInactivo ? " (INACTIVO)" : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Grupo */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground mb-1.5">
              Grupo / Especialidad{" "}
              <span className="text-accent-deep text-[12px] font-bold">*</span>
            </label>
            <Select
              value={grupoId}
              onValueChange={(v) => {
                setGrupoId(v);
                setErrorMessage(null);
              }}
            >
              <SelectTrigger className="h-9 rounded-[0.25rem] text-[14px] border-border bg-card">
                <SelectValue placeholder="Seleccionar especialidad..." />
              </SelectTrigger>
              <SelectContent>
                {grupos
                  .filter((g) => g.activo)
                  .map((g) => (
                    <SelectItem
                      key={g.id}
                      value={String(g.id)}
                      className="text-[13px]"
                    >
                      {g.tipoActividad}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha inicio */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground mb-1.5">
              Fecha de Inicio
            </label>
            <Input
              type="date"
              value={fechaInicio}
              disabled
              className="h-9 rounded-[0.25rem] text-[14px] border-border bg-[#f7f7f7] text-foreground-muted cursor-not-allowed"
            />
            <span className="text-[11px] text-foreground-muted mt-1 block">
              La fecha de inicio corresponde a la fecha actual del sistema (solo
              lectura).
            </span>
          </div>

          {/* Backend error banner */}
          {errorMessage && (
            <div className="flex items-start gap-3 px-4 py-4 bg-[#fdf0f0] border border-error rounded-[0.5rem]">
              <XCircle className="size-5 text-error shrink-0 mt-0.5" />
              <div>
                <span className="text-[13px] font-bold text-error block mb-1">
                  Asignación bloqueada
                </span>
                <span className="text-[13px] leading-5 text-foreground block">
                  {errorMessage}
                </span>
              </div>
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
            disabled={!empleadoId || !grupoId || isPending}
            className="h-9 px-5 rounded-[0.25rem] bg-primary hover:bg-primary-hover text-white disabled:opacity-40"
          >
            <Link2 className="size-4 mr-2" />
            {isPending ? "Asignando..." : "Confirmar Asignación"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
