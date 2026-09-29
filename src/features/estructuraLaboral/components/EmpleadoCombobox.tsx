import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { EmpleadoResumenResponseDto } from "@/features/legajos/types/legajo.types";

interface EmpleadoComboboxProps {
  empleados: EmpleadoResumenResponseDto[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function EmpleadoCombobox({
  empleados,
  value,
  onChange,
  placeholder = "Buscar y seleccionar empleado...",
}: EmpleadoComboboxProps) {
  const [open, setOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const seleccionado = useMemo(
    () => empleados.find((emp) => String(emp.id) === value) ?? null,
    [empleados, value]
  );

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return empleados;
    return empleados.filter((emp) => {
      const nombreCompleto = `${emp.apellido} ${emp.nombre}`.toLowerCase();
      return nombreCompleto.includes(q) || emp.dni.toLowerCase().includes(q);
    });
  }, [empleados, busqueda]);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setBusqueda("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-full items-center justify-between rounded-[0.25rem] border border-border bg-card px-3 text-left text-[14px] text-foreground"
        >
          <span className={cn("truncate", !seleccionado && "text-foreground-muted")}>
            {seleccionado
              ? `${seleccionado.apellido}, ${seleccionado.nombre} — DNI ${seleccionado.dni}`
              : placeholder}
          </span>
          <ChevronDown className="size-4 shrink-0 text-foreground-muted" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[--radix-popover-trigger-width] p-0"
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="size-4 shrink-0 text-foreground-muted" />
          <input
            autoFocus
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre, apellido o DNI..."
            className="h-6 w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-foreground-muted"
          />
        </div>
        <ul className="max-h-64 overflow-y-auto py-1">
          {filtrados.length === 0 ? (
            <li className="px-3 py-4 text-center text-[13px] text-foreground-muted">
              Ningún empleado coincide con la búsqueda.
            </li>
          ) : (
            filtrados.map((emp) => {
              const isInactivo = emp.estadoActual !== "ACTIVO";
              const isSelected = String(emp.id) === value;
              return (
                <li key={emp.id}>
                  <button
                    type="button"
                    disabled={isInactivo}
                    onClick={() => {
                      onChange(String(emp.id));
                      setOpen(false);
                      setBusqueda("");
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-left text-[13px] transition-colors",
                      isInactivo
                        ? "cursor-not-allowed text-[#aaaaaa]"
                        : "text-foreground hover:bg-subtle cursor-pointer",
                      isSelected && !isInactivo && "bg-primary-soft"
                    )}
                  >
                    <span>
                      {emp.apellido}, {emp.nombre} — DNI {emp.dni}
                      {isInactivo ? " (INACTIVO)" : ""}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
