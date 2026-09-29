import type { ConteoEstadoCuadrillaDto } from "../types/dashboard.types";

const ESTADO_LABELS: Record<string, string> = {
  ACTIVA: "Activa",
  EN_ESPERA: "En espera",
  PLANIFICADA: "Planificada",
  SUSPENDIDA: "Suspendida",
  FINALIZADA: "Finalizada",
};

// Mismo orden que el ciclo de vida de la cuadrilla, no alfabetico.
const ORDEN_ESTADOS = ["PLANIFICADA", "EN_ESPERA", "ACTIVA", "SUSPENDIDA", "FINALIZADA"];

const ESTADO_COLORS: Record<string, string> = {
  PLANIFICADA: "var(--color-primary)",
  EN_ESPERA: "var(--color-accent-deep)",
  ACTIVA: "var(--color-success)",
  SUSPENDIDA: "var(--color-error)",
  FINALIZADA: "var(--lt-neutral-300)",
};

interface CuadrillasPorEstadoChartProps {
  data: ConteoEstadoCuadrillaDto[];
}

export function CuadrillasPorEstadoChart({ data }: CuadrillasPorEstadoChartProps) {
  const total = data.reduce((acc, d) => acc + d.cantidad, 0);

  if (total === 0) {
    return (
      <p className="py-6 text-sm text-foreground-muted">
        No hay cuadrillas para mostrar en tu alcance.
      </p>
    );
  }

  const filas = [...data]
    .filter((d) => d.cantidad > 0)
    .sort((a, b) => ORDEN_ESTADOS.indexOf(a.estado) - ORDEN_ESTADOS.indexOf(b.estado));

  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-subtle">
        {filas.map((fila) => (
          <div
            key={fila.estado}
            style={{
              width: `${(fila.cantidad / total) * 100}%`,
              backgroundColor: ESTADO_COLORS[fila.estado] ?? "var(--lt-neutral-300)",
            }}
          />
        ))}
      </div>

      <ul className="mt-4 space-y-2.5">
        {filas.map((fila) => (
          <li key={fila.estado} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-foreground">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: ESTADO_COLORS[fila.estado] ?? "var(--lt-neutral-300)" }}
              />
              {ESTADO_LABELS[fila.estado] ?? fila.estado}
            </span>
            <span className="tabular-nums font-semibold text-foreground">{fila.cantidad}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
