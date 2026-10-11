import { useState, useEffect, useRef, useId, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Check, ChevronDown, Loader2, RotateCcw, Search, UserRound, X } from "lucide-react";
import { legajosApi } from "@/features/legajos/api/legajosApi";
import type { EmpleadoResumenResponseDto } from "@/features/legajos/types/legajo.types";
import { cn } from "@/shared/utils/cn";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui";

interface EppEmpleadoComboboxProps {
  value: number; // 0 significa sin selección
  onChange: (id: number) => void;
  disabled?: boolean;
  error?: string;
  id?: string;
}

export function EppEmpleadoCombobox({
  value,
  onChange,
  disabled = false,
  error,
  id: propId,
}: EppEmpleadoComboboxProps) {
  const generatedId = useId();
  const triggerId = propId || generatedId;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Mantener localmente el empleado seleccionado para que su etiqueta
  // siga visible aun cuando el texto de búsqueda o los resultados de la query cambien
  const [selectedEmpleado, setSelectedEmpleado] = useState<EmpleadoResumenResponseDto | null>(null);

  // Debounce de 300 ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Búsqueda en servidor:
  // - Término vacío: trae los primeros 20 activos ordenados por apellido
  // - Con término: trae los primeros 20 filtrados en backend
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["epp", "empleados-activos-search", debouncedSearch.trim()],
    queryFn: () =>
      legajosApi.getPaginados({
        estado: "ACTIVO",
        buscar: debouncedSearch.trim() || undefined,
        size: 20,
        sort: "usuario.apellido,asc",
      }),
    placeholderData: keepPreviousData,
    enabled: open, // Consultar al abrir el popover
  });

  const empleados: EmpleadoResumenResponseDto[] = useMemo(
    () => data?.content ?? [],
    [data?.content],
  );
  const totalElements = data?.totalElements ?? 0;

  // Derivar la entidad seleccionada sin efectos secundarios
  const resolvedEmpleado = useMemo(() => {
    if (!value) return null;
    if (selectedEmpleado && selectedEmpleado.id === value) return selectedEmpleado;
    return empleados.find((e: EmpleadoResumenResponseDto) => e.id === value) ?? null;
  }, [value, selectedEmpleado, empleados]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (disabled) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
      setDebouncedSearch("");
    } else {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleSelect = (emp: EmpleadoResumenResponseDto) => {
    setSelectedEmpleado(emp);
    onChange(emp.id);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEmpleado(null);
    onChange(0);
  };

  const displayLabel = resolvedEmpleado
    ? `${resolvedEmpleado.apellido}, ${resolvedEmpleado.nombre} (DNI: ${resolvedEmpleado.dni})`
    : null;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={triggerId}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-control border border-border-strong bg-card px-3 text-sm text-foreground outline-none transition",
            "hover:border-primary/60 focus:border-primary focus:ring-2 focus:ring-primary/20",
            "disabled:cursor-not-allowed disabled:bg-subtle disabled:text-foreground-muted",
            error && "border-error focus:border-error focus:ring-error/15",
            !displayLabel && "text-foreground-muted",
          )}
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            <UserRound className="size-4 shrink-0 text-foreground-muted" />
            <span className="truncate">
              {displayLabel || "-- Seleccioná un empleado --"}
            </span>
          </span>
          <div className="flex items-center gap-1">
            {displayLabel && !disabled && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Limpiar selección"
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClear(e as unknown as React.MouseEvent);
                  }
                }}
                className="rounded p-0.5 text-foreground-muted hover:bg-subtle hover:text-foreground"
              >
                <X className="size-3.5" />
              </span>
            )}
            <ChevronDown className="size-4 shrink-0 text-foreground-muted" />
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[320px] p-0"
        align="start"
      >
        {/* Buscador interno con Input y autofocus */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="size-4 shrink-0 text-foreground-muted" />
          <input
            ref={inputRef}
            placeholder="Buscar por nombre, apellido, DNI o CUIL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            className="h-7 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-muted"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-foreground-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Lista de resultados y estados */}
        <div className="max-h-60 overflow-y-auto py-1">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-foreground-muted">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>Cargando empleados...</span>
            </div>
          ) : isError ? (
            <div className="space-y-2 px-3 py-4 text-center">
              <p className="text-sm text-error">
                No se pudo cargar la lista de empleados.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <RotateCcw className="size-3" />
                Reintentar
              </button>
            </div>
          ) : empleados.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-foreground-muted">
              {debouncedSearch.trim()
                ? `Sin resultados para "${debouncedSearch.trim()}"`
                : "No se encontraron empleados activos."}
            </div>
          ) : (
            <>
              {totalElements > 20 && (
                <div className="border-b border-border bg-subtle/50 px-3 py-1.5 text-[11px] text-foreground-muted">
                  Mostrando los primeros 20 de {totalElements}. Escribí para filtrar.
                </div>
              )}
              {empleados.map((emp) => {
                const isSelected = emp.id === value;
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => handleSelect(emp)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-subtle",
                      isSelected && "bg-primary-soft text-primary font-medium",
                    )}
                  >
                    <span className="truncate">
                      {emp.apellido}, {emp.nombre}{" "}
                      <span className="text-xs text-foreground-muted">
                        (DNI: {emp.dni})
                      </span>
                    </span>
                    {isSelected && (
                      <Check className="size-4 shrink-0 text-primary" />
                    )}
                  </button>
                );
              })}
            </>
          )}
        </div>
        {isFetching && !isLoading && (
          <div className="flex items-center justify-end border-t border-border bg-card/60 px-2 py-1 text-[11px] text-foreground-muted">
            <Loader2 className="mr-1 size-3 animate-spin" />
            Actualizando...
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
