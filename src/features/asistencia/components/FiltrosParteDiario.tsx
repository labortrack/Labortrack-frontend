import { RotateCcw } from "lucide-react";
import type {
  EstadoAsistencia,
  OpcionesFiltroAsistenciaResponseDto,
} from "../types/asistencia.types";
import { ESTADO_ASISTENCIA_LABELS } from "../utils/asistenciaFormatters";
import { Button, Card, CardContent, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui";
import { SearchInput } from "@/shared/components";

const TODOS = "todos";

interface FiltrosParteDiarioProps {
  fecha: string;
  obraId?: number;
  cuadrillaId?: number;
  estado?: EstadoAsistencia;
  trabajador: string;
  opciones?: OpcionesFiltroAsistenciaResponseDto;
  opcionesCargando: boolean;
  puedeFiltrarObra: boolean;
  puedeFiltrarCuadrilla: boolean;
  onFechaChange: (fecha: string) => void;
  onObraChange: (obraId?: number) => void;
  onCuadrillaChange: (cuadrillaId?: number) => void;
  onEstadoChange: (estado?: EstadoAsistencia) => void;
  onTrabajadorChange: (trabajador: string) => void;
  onLimpiar: () => void;
}

export function FiltrosParteDiario({
  fecha,
  obraId,
  cuadrillaId,
  estado,
  trabajador,
  opciones,
  opcionesCargando,
  puedeFiltrarObra,
  puedeFiltrarCuadrilla,
  onFechaChange,
  onObraChange,
  onCuadrillaChange,
  onEstadoChange,
  onTrabajadorChange,
  onLimpiar,
}: FiltrosParteDiarioProps) {
  const cuadrillas = (opciones?.cuadrillas ?? []).filter(
    (cuadrilla) => !obraId || cuadrilla.obraId === obraId,
  );

  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Filtros</h2>
            <p className="mt-0.5 text-xs text-foreground-muted">
              Los resultados respetan tu alcance operativo.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onLimpiar}>
            <RotateCcw />
            Limpiar
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div>
            <Label htmlFor="fecha-parte" className="mb-1.5 block">
              Fecha
            </Label>
            <Input
              id="fecha-parte"
              type="date"
              value={fecha}
              onChange={(event) => onFechaChange(event.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="obra-parte" className="mb-1.5 block">
              Obra
            </Label>
            <Select
              value={obraId ? String(obraId) : TODOS}
              disabled={opcionesCargando || !puedeFiltrarObra}
              onValueChange={(value) =>
                onObraChange(value === TODOS ? undefined : Number(value))
              }
            >
              <SelectTrigger id="obra-parte">
                <SelectValue placeholder="Todas las obras" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todas las obras</SelectItem>
                {(opciones?.obras ?? []).map((obra) => (
                  <SelectItem key={obra.id} value={String(obra.id)}>
                    {obra.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cuadrilla-parte" className="mb-1.5 block">
              Cuadrilla
            </Label>
            <Select
              value={cuadrillaId ? String(cuadrillaId) : TODOS}
              disabled={
                opcionesCargando ||
                !puedeFiltrarCuadrilla ||
                cuadrillas.length === 0
              }
              onValueChange={(value) =>
                onCuadrillaChange(value === TODOS ? undefined : Number(value))
              }
            >
              <SelectTrigger id="cuadrilla-parte">
                <SelectValue placeholder="Todas las cuadrillas" />
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

          <div>
            <Label htmlFor="estado-parte" className="mb-1.5 block">
              Estado
            </Label>
            <Select
              value={estado ?? TODOS}
              onValueChange={(value) =>
                onEstadoChange(
                  value === TODOS ? undefined : (value as EstadoAsistencia),
                )
              }
            >
              <SelectTrigger id="estado-parte">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos los estados</SelectItem>
                {Object.entries(ESTADO_ASISTENCIA_LABELS).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="trabajador-parte" className="mb-1.5 block">
              Trabajador
            </Label>
            <SearchInput
              id="trabajador-parte"
              value={trabajador}
              placeholder="Nombre o apellido"
              onChange={(event) => onTrabajadorChange(event.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
