import { useState } from "react";
import { FilterX, Search } from "lucide-react";
import type { EmpleadoFilterParams } from "../types/legajo.types";
import { CATEGORIA_LABELS, ESTADO_LABELS } from "../types/legajo.types";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";

interface EmpleadoFiltersProps {
  initialFilters: EmpleadoFilterParams;
  onApplyFilters: (filters: EmpleadoFilterParams) => void;
  onResetFilters: () => void;
  isPending?: boolean;
}

export function EmpleadoFilters({
  initialFilters,
  onApplyFilters,
  onResetFilters,
  isPending,
}: EmpleadoFiltersProps) {
  const [buscar, setBuscar] = useState(initialFilters.buscar || "");
  const [categoria, setCategoria] = useState<string>(
    initialFilters.categoria || "ALL",
  );
  const [estado, setEstado] = useState<string>(
    initialFilters.estado || "ALL",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters({
      buscar: buscar.trim(),
      categoria: categoria === "ALL" ? "" : categoria,
      estado: estado === "ALL" ? "" : estado,
    });
  };

  const handleReset = () => {
    setBuscar("");
    setCategoria("ALL");
    setEstado("ALL");
    onResetFilters();
  };

  const hasActiveFilters =
    buscar.trim() !== "" || categoria !== "ALL" || estado !== "ALL";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-card border border-border bg-card p-4 shadow-soft sm:flex-row sm:items-end"
    >
      <div className="flex-1 min-w-[220px]">
        <label
          htmlFor="search-employee-input"
          className="mb-1.5 block text-xs font-semibold text-foreground-muted"
        >
          Buscar empleado
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
          <Input
            id="search-employee-input"
            type="text"
            placeholder="DNI, Nombre, Apellido, CUIL o IERIC..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="w-full sm:w-52">
        <label
          htmlFor="category-select"
          className="mb-1.5 block text-xs font-semibold text-foreground-muted"
        >
          Categoría UOCRA
        </label>
        <Select
          value={categoria}
          onValueChange={(val) => setCategoria(val)}
        >
          <SelectTrigger id="category-select" aria-label="Categoría UOCRA">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent side="bottom" align="start">
            <SelectItem value="ALL">Todas las categorías</SelectItem>
            {Object.keys(CATEGORIA_LABELS).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {CATEGORIA_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-48">
        <label
          htmlFor="state-select"
          className="mb-1.5 block text-xs font-semibold text-foreground-muted"
        >
          Estado
        </label>
        <Select
          value={estado}
          onValueChange={(val) => setEstado(val)}
        >
          <SelectTrigger id="state-select" aria-label="Estado del empleado">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent side="bottom" align="start">
            <SelectItem value="ALL">Activos / En Obra (Por Defecto)</SelectItem>
            {Object.keys(ESTADO_LABELS).map((est) => (
              <SelectItem key={est} value={est}>
                {ESTADO_LABELS[est]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 pt-1 sm:pt-0">
        <Button type="submit" disabled={isPending}>
          <Search className="size-4" />
          Buscar
        </Button>

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isPending}
            title="Limpiar filtros y volver a por defecto"
          >
            <FilterX className="size-4" />
            Limpiar
          </Button>
        ) : null}
      </div>
    </form>
  );
}
