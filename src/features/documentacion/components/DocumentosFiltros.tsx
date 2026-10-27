import { useState } from "react";
import {
  Check,
  ChevronDown,
  Loader2,
  RotateCcw,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { SearchInput } from "@/shared/components";
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import { cn } from "@/shared/utils/cn";
import type { EmpleadoResumenDto } from "../api/documentacionApi";
import {
  useBuscarEmpleados,
  useTiposDocumentoCompleto,
} from "../hooks/useDocumentacion";
import {
  validarRangoFechas,
  type DocumentosFiltrosValores,
} from "../utils/documentosFiltros";

const TODOS_LOS_TIPOS = "todos";

// ─── Subcomponente: EmpleadoFiltroCombobox ────────────────────────────────────
//
// Combobox asíncrono para filtrar por empleado (solo ADMIN / RRHH).
// Guarda el empleado completo para poder mostrar su nombre en el trigger
// aunque ya no figure entre los resultados de la última búsqueda.

interface EmpleadoFiltroComboboxProps {
  id: string;
  value: EmpleadoResumenDto | null;
  onChange: (empleado: EmpleadoResumenDto | null) => void;
}

function EmpleadoFiltroCombobox({ id, value, onChange }: EmpleadoFiltroComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isFetching } = useBuscarEmpleados(search);
  const empleados = data?.content ?? [];

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSearch("");
  };

  const seleccionar = (empleado: EmpleadoResumenDto | null) => {
    onChange(empleado);
    handleOpenChange(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-control border border-border bg-card px-3 py-2 text-sm",
            "hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30",
            !value && "text-foreground-muted",
          )}
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            <UserRound className="size-4 shrink-0 text-foreground-muted" />
            <span className="truncate">
              {value ? `${value.apellido}, ${value.nombre}` : "Todos los empleados"}
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0 text-foreground-muted" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-64 p-0"
        align="start"
      >
        {/* Campo de búsqueda */}
        <div className="border-b border-border px-3 py-2">
          <Input
            autoFocus
            placeholder="Nombre, apellido o DNI..."
            aria-label="Buscar empleado"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
          />
        </div>

        {/* Lista de resultados */}
        <div className="max-h-56 overflow-y-auto">
          {value ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-foreground-muted hover:bg-subtle"
              onClick={() => seleccionar(null)}
            >
              <X className="size-4" />
              Quitar filtro de empleado
            </button>
          ) : null}

          {isFetching ? (
            <div className="flex items-center gap-2 px-3 py-4 text-sm text-foreground-muted">
              <Loader2 className="size-4 animate-spin" />
              Buscando...
            </div>
          ) : search.trim().length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-foreground-muted">
              Escribí un nombre o apellido para buscar.
            </p>
          ) : empleados.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-foreground-muted">
              Sin resultados para &quot;{search}&quot;
            </p>
          ) : (
            empleados.map((emp) => (
              <button
                key={emp.id}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-subtle",
                  value?.id === emp.id && "bg-primary/5 font-medium text-primary",
                )}
                onClick={() => seleccionar(emp)}
              >
                {value?.id === emp.id ? (
                  <Check className="size-4 shrink-0 text-primary" />
                ) : (
                  <span className="size-4 shrink-0" />
                )}
                <span className="min-w-0 flex-1 truncate">
                  <span className="font-medium">
                    {emp.apellido}, {emp.nombre}
                  </span>
                  <span className="ml-2 text-xs text-foreground-muted">
                    DNI {emp.dni}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface DocumentosFiltrosProps {
  /** Prefijo para los `id` de los campos; permite dos barras en la misma página. */
  idPrefix: string;
  valores: DocumentosFiltrosValores;
  onChange: (valores: DocumentosFiltrosValores) => void;
  onLimpiar: () => void;
  /**
   * Si se indica, el texto se aplica con el botón "Buscar" o Enter (filtrado en
   * servidor). Si se omite, el texto filtra a medida que se escribe (en memoria).
   */
  onBuscar?: () => void;
  /** Muestra el filtro por empleado. Solo para ADMIN / RRHH. */
  mostrarEmpleado?: boolean;
  placeholder: string;
}

export function DocumentosFiltros({
  idPrefix,
  valores,
  onChange,
  onLimpiar,
  onBuscar,
  mostrarEmpleado = false,
  placeholder,
}: DocumentosFiltrosProps) {
  const { data: tipos = [], isLoading: isLoadingTipos } = useTiposDocumentoCompleto();
  const errorFechas = validarRangoFechas(valores.fechaDesde, valores.fechaHasta);

  const cambiar = (parcial: Partial<DocumentosFiltrosValores>) =>
    onChange({ ...valores, ...parcial });

  return (
    <Card>
      <CardContent className="space-y-4">
        {/* Buscador */}
        {/* En mobile el buscador ocupa su propia fila y los botones van debajo. */}
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <SearchInput
            placeholder={placeholder}
            aria-label={placeholder}
            value={valores.nombre}
            onChange={(e) => cambiar({ nombre: e.target.value })}
            onKeyDown={onBuscar ? (e) => e.key === "Enter" && onBuscar() : undefined}
            containerClassName="basis-full sm:basis-auto sm:flex-1"
          />
          {onBuscar ? (
            <Button onClick={onBuscar} className="flex-1 sm:flex-none">
              <Search />
              Buscar
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="icon"
            onClick={onLimpiar}
            aria-label="Limpiar filtros"
          >
            <RotateCcw />
          </Button>
        </div>

        {/* Filtros */}
        <div
          className={cn(
            "grid gap-3 sm:grid-cols-2",
            mostrarEmpleado ? "lg:grid-cols-4" : "lg:grid-cols-3",
          )}
        >
          <div>
            <Label htmlFor={`${idPrefix}-tipo`} className="mb-1.5 block">
              Tipo de documento
            </Label>
            <Select
              value={valores.tipoDocumentoId ? String(valores.tipoDocumentoId) : TODOS_LOS_TIPOS}
              onValueChange={(val) =>
                cambiar({ tipoDocumentoId: val === TODOS_LOS_TIPOS ? undefined : Number(val) })
              }
              disabled={isLoadingTipos}
            >
              <SelectTrigger id={`${idPrefix}-tipo`}>
                <SelectValue placeholder={isLoadingTipos ? "Cargando tipos..." : "Todos los tipos"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS_LOS_TIPOS}>Todos los tipos</SelectItem>
                {tipos.map((tipo) => {
                  const id = tipo.idTipoDocumento ?? tipo.id;
                  if (id == null) return null;
                  return (
                    <SelectItem key={id} value={String(id)}>
                      {tipo.nombre}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={`${idPrefix}-desde`} className="mb-1.5 block">
              Fecha desde
            </Label>
            <Input
              id={`${idPrefix}-desde`}
              type="date"
              value={valores.fechaDesde}
              max={valores.fechaHasta || undefined}
              onChange={(e) => cambiar({ fechaDesde: e.target.value })}
              aria-invalid={Boolean(errorFechas)}
              aria-describedby={errorFechas ? `${idPrefix}-fechas-error` : undefined}
            />
          </div>

          <div>
            <Label htmlFor={`${idPrefix}-hasta`} className="mb-1.5 block">
              Fecha hasta
            </Label>
            <Input
              id={`${idPrefix}-hasta`}
              type="date"
              value={valores.fechaHasta}
              min={valores.fechaDesde || undefined}
              onChange={(e) => cambiar({ fechaHasta: e.target.value })}
              aria-invalid={Boolean(errorFechas)}
              aria-describedby={errorFechas ? `${idPrefix}-fechas-error` : undefined}
            />
          </div>

          {mostrarEmpleado ? (
            <div>
              <Label htmlFor={`${idPrefix}-empleado`} className="mb-1.5 block">
                Empleado
              </Label>
              <EmpleadoFiltroCombobox
                id={`${idPrefix}-empleado`}
                value={valores.empleado}
                onChange={(empleado) => cambiar({ empleado })}
              />
            </div>
          ) : null}
        </div>

        {errorFechas ? (
          <p id={`${idPrefix}-fechas-error`} role="alert" className="text-sm text-error">
            {errorFechas}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
