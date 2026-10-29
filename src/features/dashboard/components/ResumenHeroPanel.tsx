import { Building2, ChevronRight, UserX, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/shared/ui";

interface ResumenHeroPanelProps {
  asistenciaPorcentaje: number;
  empleadosActivos: number;
  obrasActivas: number;
  ausenciasHoy: number;
  /** Nomenclatura de la obra por la que se filtra el tablero, si hay filtro. */
  obraFiltrada?: string;
  /** Detalle de las ausencias en el parte diario; sin link si no hay acceso. */
  ausenciasHref?: string;
}

function StatItem({
  icon: Icon,
  value,
  label,
  href,
  hrefTitle,
}: {
  icon: typeof Users;
  value: number;
  label: string;
  href?: string;
  hrefTitle?: string;
}) {
  const contenido = (
    <>
      <Icon className="size-4 shrink-0 text-foreground-muted" />
      <div className="leading-tight">
        <p className="text-xl font-bold tabular-nums text-foreground">{value}</p>
        <p className="text-xs text-foreground-muted">{label}</p>
      </div>
    </>
  );

  if (!href) {
    return <div className="flex items-center gap-2.5">{contenido}</div>;
  }

  return (
    <Link
      to={href}
      title={hrefTitle}
      className="group -m-2 flex items-center gap-2.5 rounded-control p-2 transition-colors hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      {contenido}
      <ChevronRight className="size-4 text-foreground-muted transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function ResumenHeroPanel({
  asistenciaPorcentaje,
  empleadosActivos,
  obrasActivas,
  ausenciasHoy,
  obraFiltrada,
  ausenciasHref,
}: ResumenHeroPanelProps) {
  const porcentajeAcotado = Math.min(100, Math.max(0, asistenciaPorcentaje));

  return (
    <Card className="px-6 py-7 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        {/* Numero del dia + gauge */}
        <div className="max-w-sm">
          <p className="text-sm text-foreground-muted">
            Asistencia de hoy
            {obraFiltrada ? (
              <span className="font-semibold text-foreground"> · {obraFiltrada}</span>
            ) : null}
          </p>
          <p className="mt-1 text-7xl font-extrabold leading-none tabular-nums text-primary sm:text-8xl">
            {asistenciaPorcentaje.toFixed(0)}
            <span className="text-3xl font-bold text-primary/60 sm:text-4xl">%</span>
          </p>
          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-subtle">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${porcentajeAcotado}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-foreground-muted">
            Proporción de operarios presentes sobre lo esperado para hoy.
          </p>
        </div>

        {/* Trio de estadisticas de soporte */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-5 lg:justify-end">
          <StatItem icon={Users} value={empleadosActivos} label="Empleados activos" />
          <span className="hidden h-10 w-px bg-border lg:block" />
          <StatItem icon={Building2} value={obrasActivas} label="Obras activas" />
          <span className="hidden h-10 w-px bg-border lg:block" />
          <StatItem
            icon={UserX}
            value={ausenciasHoy}
            label="Ausencias hoy"
            href={ausenciasHref}
            hrefTitle="Ver ausentes en el parte diario"
          />
        </div>
      </div>
    </Card>
  );
}
