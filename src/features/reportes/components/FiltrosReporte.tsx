import { useObras } from "@/features/obra/hooks/useObras";
import { useCuadrillasPorObra } from "@/features/cuadrilla/hooks/useCuadrillas";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import type { ReporteFiltros, TipoReporteResponseDto } from "../types/reporte.types";
import { formatearEnum } from "../utils/formatoReporte";

const TODOS = "todos";
const MAX_CUADRILLAS = 100;

interface FiltrosReporteProps {
  tipo: TipoReporteResponseDto;
  filtros: ReporteFiltros;
  onChange: (filtros: ReporteFiltros) => void;
}

/** Muestra solo los filtros que declara el reporte seleccionado. */
export function FiltrosReporte({ tipo, filtros, onChange }: FiltrosReporteProps) {
  const admiteObra = tipo.filtros.includes("OBRA");
  const admiteCuadrilla = tipo.filtros.includes("CUADRILLA");
  const obrasQuery = useObras(undefined, admiteObra);
  const cuadrillasQuery = useCuadrillasPorObra(
    admiteCuadrilla ? (filtros.obraId ?? 0) : 0,
    0,
    MAX_CUADRILLAS,
  );
  const cuadrillas = cuadrillasQuery.data?.content ?? [];

  const actualizar = (cambios: Partial<ReporteFiltros>) => onChange({ ...filtros, ...cambios });

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {tipo.filtros.includes("RANGO_FECHAS") ? (
        <>
          <div>
            <Label htmlFor="reporte-desde" className="mb-1.5 block">
              Desde
            </Label>
            <Input
              id="reporte-desde"
              type="date"
              value={filtros.fechaDesde ?? ""}
              onChange={(event) => actualizar({ fechaDesde: event.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="reporte-hasta" className="mb-1.5 block">
              Hasta
            </Label>
            <Input
              id="reporte-hasta"
              type="date"
              value={filtros.fechaHasta ?? ""}
              onChange={(event) => actualizar({ fechaHasta: event.target.value })}
            />
          </div>
        </>
      ) : null}

      {tipo.filtros.includes("FECHA_CORTE") ? (
        <div>
          <Label htmlFor="reporte-corte" className="mb-1.5 block">
            Fecha de corte
          </Label>
          <Input
            id="reporte-corte"
            type="date"
            value={filtros.fechaCorte ?? ""}
            onChange={(event) => actualizar({ fechaCorte: event.target.value })}
          />
        </div>
      ) : null}

      {admiteObra ? (
        <div>
          <Label htmlFor="reporte-obra" className="mb-1.5 block">
            Obra
          </Label>
          <Select
            value={filtros.obraId ? String(filtros.obraId) : TODOS}
            disabled={obrasQuery.isLoading}
            onValueChange={(value) =>
              actualizar({
                obraId: value === TODOS ? undefined : Number(value),
                cuadrillaId: undefined,
              })
            }
          >
            <SelectTrigger id="reporte-obra">
              <SelectValue placeholder="Todas las obras" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas las obras</SelectItem>
              {(obrasQuery.data ?? []).map((obra) => (
                <SelectItem key={obra.id} value={String(obra.id)}>
                  {obra.nombreObra}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {admiteCuadrilla ? (
        <div>
          <Label htmlFor="reporte-cuadrilla" className="mb-1.5 block">
            Cuadrilla
          </Label>
          <Select
            value={filtros.cuadrillaId ? String(filtros.cuadrillaId) : TODOS}
            disabled={!filtros.obraId || cuadrillasQuery.isLoading}
            onValueChange={(value) =>
              actualizar({ cuadrillaId: value === TODOS ? undefined : Number(value) })
            }
          >
            <SelectTrigger id="reporte-cuadrilla">
              <SelectValue
                placeholder={filtros.obraId ? "Todas las cuadrillas" : "Elegí una obra primero"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todas las cuadrillas</SelectItem>
              {cuadrillas.map((cuadrilla) => (
                <SelectItem key={cuadrilla.id} value={String(cuadrilla.id)}>
                  {cuadrilla.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {tipo.filtros.includes("ESTADO") ? (
        <div>
          <Label htmlFor="reporte-estado" className="mb-1.5 block">
            Estado
          </Label>
          <Select
            value={filtros.estado ?? TODOS}
            onValueChange={(value) => actualizar({ estado: value === TODOS ? undefined : value })}
          >
            <SelectTrigger id="reporte-estado">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos los estados</SelectItem>
              {tipo.opcionesEstado.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {formatearEnum(estado)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  );
}
