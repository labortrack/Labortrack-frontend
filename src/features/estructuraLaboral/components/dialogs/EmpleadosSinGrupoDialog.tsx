import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Button,
} from "@/shared/ui";
import { Link2 } from "lucide-react";
import type { EmpleadoResumenResponseDto } from "@/features/legajos/types/legajo.types";

interface EmpleadosSinGrupoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empleados: EmpleadoResumenResponseDto[];
  onAsignar: (empleado: EmpleadoResumenResponseDto) => void;
}

export function EmpleadosSinGrupoDialog({
  open,
  onOpenChange,
  empleados,
  onAsignar,
}: EmpleadosSinGrupoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[0.5rem] p-0 gap-0 overflow-hidden">
        <div className="px-6 py-5 pr-14 border-b border-border bg-card">
          <DialogTitle className="text-[20px] font-medium leading-6 text-foreground p-0 m-0">
            Empleados sin grupo asignado
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-5 text-foreground-muted mt-1">
            Todavía no tienen ninguna especialidad operativa vigente.
          </DialogDescription>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {empleados.length === 0 ? (
            <p className="px-6 py-10 text-center text-[13px] text-foreground-muted">
              Todos los empleados activos tienen un grupo vigente asignado.
            </p>
          ) : (
            <ul className="divide-y divide-[#f0f0f0]">
              {empleados.map((emp) => (
                <li
                  key={emp.id}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <div>
                    <span className="text-[13px] font-bold text-foreground block">
                      {emp.apellido}, {emp.nombre}
                    </span>
                    <span className="text-[12px] text-foreground-muted block">
                      DNI {emp.dni}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onAsignar(emp)}
                    className="h-8 px-3 rounded-[0.25rem] bg-primary hover:bg-primary-hover text-white"
                  >
                    <Link2 className="size-3.5 mr-1.5" />
                    Asignar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-end px-6 py-4 border-t border-border bg-[#f7f7f7]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-[0.25rem] border-border text-foreground hover:bg-[#f0f0f0]"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
