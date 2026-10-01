import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { EmpleadoResumenResponseDto } from "@/features/legajos/types/legajo.types";

interface EmpleadoComboboxProps {
  empleados: EmpleadoResumenResponseDto[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function formatearEmpleado(emp: EmpleadoResumenResponseDto): string {
  return `${emp.apellido}, ${emp.nombre} — DNI ${emp.dni}`;
}

export function EmpleadoCombobox({
  empleados,
  value,
  onChange,
  placeholder = "Buscar empleado por nombre, apellido o DNI...",
}: EmpleadoComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const seleccionado = useMemo(
    () => empleados.find((emp) => String(emp.id) === value) ?? null,
    [empleados, value]
  );

  // Mientras el campo no esta en edicion, muestra el nombre del empleado
  // seleccionado. Al enfocar se limpia para poder buscar desde cero.
  const displayValue = open
    ? query
    : seleccionado
      ? formatearEmpleado(seleccionado)
      : "";

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return empleados;
    return empleados.filter((emp) => {
      const nombreCompleto = `${emp.apellido} ${emp.nombre}`.toLowerCase();
      return nombreCompleto.includes(q) || emp.dni.toLowerCase().includes(q);
    });
  }, [empleados, query]);

  const seleccionar = (emp: EmpleadoResumenResponseDto) => {
    onChange(String(emp.id));
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex h-9 w-full items-center gap-2 rounded-[0.25rem] border border-border bg-card px-3">
        <Search className="size-4 shrink-0 text-foreground-muted" />
        <input
          value={displayValue}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.currentTarget.blur();
            }
          }}
          placeholder={placeholder}
          className="h-full w-full min-w-0 bg-transparent text-[14px] text-foreground outline-none placeholder:text-foreground-muted"
        />
      </div>

      {open ? (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-[0.25rem] border border-border bg-card py-1 shadow-floating">
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
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => seleccionar(emp)}
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
      ) : null}
    </div>
  );
}
