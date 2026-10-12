import type { EstadoAsistencia } from "@/features/asistencia/types/asistencia.types";
import { ESTADO_ASISTENCIA_LABELS } from "@/features/asistencia/utils/asistenciaFormatters";
import { fechaLocalHoy } from "@/features/ausentismo/utils/solicitudAusenciaFormatters";
import { cn } from "@/shared/utils/cn";
import type { DiaAsistenciaDto } from "../types/dashboard.types";

const DIAS_SEMANA = ["L", "M", "M", "J", "V", "S", "D"];

// Si un dia tiene mas de una asistencia (p. ej. una jornada extraordinaria),
// se muestra la de mayor prioridad: primero lo que requiere atencion.
const PRIORIDAD: EstadoAsistencia[] = [
  "AUSENTE",
  "AUSENCIA_JUSTIFICADA",
  "PENDIENTE_INGRESO",
  "PRESENTE",
  "EGRESADO",
  "NO_TRABAJADA_COMPUTABLE",
];

type Grupo = "presente" | "ausente" | "justificada" | "pendiente" | "otro";

const GRUPO_POR_ESTADO: Record<EstadoAsistencia, Grupo> = {
  PRESENTE: "presente",
  EGRESADO: "presente",
  AUSENTE: "ausente",
  AUSENCIA_JUSTIFICADA: "justificada",
  PENDIENTE_INGRESO: "pendiente",
  NO_TRABAJADA_COMPUTABLE: "otro",
  ANULADA: "otro",
};

const ESTILO_GRUPO: Record<Grupo, string> = {
  presente: "bg-success-soft text-success",
  ausente: "bg-error-soft text-error-strong",
  justificada: "bg-warning-soft text-warning",
  pendiente: "bg-primary-soft text-primary",
  otro: "bg-muted text-foreground-muted",
};

const LEYENDA: { grupo: Grupo; label: string }[] = [
  { grupo: "presente", label: "Presente" },
  { grupo: "ausente", label: "Ausente" },
  { grupo: "justificada", label: "Justificada" },
  { grupo: "pendiente", label: "Pendiente" },
];

interface CalendarioAsistenciaMesProps {
  data: DiaAsistenciaDto[];
}

export function CalendarioAsistenciaMes({ data }: CalendarioAsistenciaMesProps) {
  const hoy = fechaLocalHoy();
  const [anio, mes] = hoy.split("-").map(Number);
  const diasEnMes = new Date(anio, mes, 0).getDate();
  // getDay(): 0 = domingo; la grilla empieza el lunes.
  const offset = (new Date(anio, mes - 1, 1).getDay() + 6) % 7;

  const estadoPorFecha = new Map<string, EstadoAsistencia>();
  for (const dia of data) {
    const actual = estadoPorFecha.get(dia.fecha);
    if (!actual || PRIORIDAD.indexOf(dia.estado) < PRIORIDAD.indexOf(actual)) {
      estadoPorFecha.set(dia.fecha, dia.estado);
    }
  }

  const nombreMes = new Date(anio, mes - 1, 1).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <p className="mb-3 text-xs font-medium capitalize text-foreground-muted">{nombreMes}</p>
      <div className="grid grid-cols-7 gap-1 text-center">
        {DIAS_SEMANA.map((dia, i) => (
          <span key={i} className="pb-1 text-[11px] font-semibold text-foreground-muted">
            {dia}
          </span>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <span key={`vacio-${i}`} />
        ))}
        {Array.from({ length: diasEnMes }, (_, i) => {
          const numero = i + 1;
          const fecha = `${anio}-${String(mes).padStart(2, "0")}-${String(numero).padStart(2, "0")}`;
          const estado = estadoPorFecha.get(fecha);
          const esHoy = fecha === hoy;
          return (
            <span
              key={fecha}
              title={estado ? ESTADO_ASISTENCIA_LABELS[estado] : undefined}
              className={cn(
                "flex aspect-square items-center justify-center rounded-control text-xs tabular-nums",
                estado ? ESTILO_GRUPO[GRUPO_POR_ESTADO[estado]] : "text-foreground-muted",
                estado ? "font-semibold" : "",
                esHoy && "ring-2 ring-primary ring-offset-1 ring-offset-card",
              )}
            >
              {numero}
            </span>
          );
        })}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
        {LEYENDA.map(({ grupo, label }) => (
          <li key={grupo} className="flex items-center gap-1.5 text-xs text-foreground-muted">
            <span className={cn("size-2.5 rounded-sm", ESTILO_GRUPO[grupo])} />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
