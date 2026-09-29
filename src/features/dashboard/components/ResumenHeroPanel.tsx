import { Building2, UserX, Users } from "lucide-react";

interface ResumenHeroPanelProps {
  asistenciaPorcentaje: number;
  empleadosActivos: number;
  obrasActivas: number;
  ausenciasHoy: number;
}

function CornerTicks() {
  const arm = "absolute size-4 border-primary/25";
  return (
    <>
      <span className={`${arm} left-0 top-0 border-t border-l`} />
      <span className={`${arm} right-0 top-0 border-t border-r`} />
      <span className={`${arm} left-0 bottom-0 border-b border-l`} />
      <span className={`${arm} right-0 bottom-0 border-b border-r`} />
    </>
  );
}

function StatItem({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Users;
  value: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="size-4 shrink-0 text-foreground-muted" />
      <div className="leading-tight">
        <p className="text-xl font-bold tabular-nums text-foreground">{value}</p>
        <p className="text-xs text-foreground-muted">{label}</p>
      </div>
    </div>
  );
}

export function ResumenHeroPanel({
  asistenciaPorcentaje,
  empleadosActivos,
  obrasActivas,
  ausenciasHoy,
}: ResumenHeroPanelProps) {
  const porcentajeAcotado = Math.min(100, Math.max(0, asistenciaPorcentaje));

  return (
    <div className="relative rounded-card border border-border/70 bg-card px-6 py-7 sm:px-8 sm:py-8">
      <CornerTicks />

      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        {/* Numero del dia + gauge */}
        <div className="max-w-sm">
          <p className="text-sm text-foreground-muted">Asistencia de hoy</p>
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
          <StatItem icon={UserX} value={ausenciasHoy} label="Ausencias hoy" />
        </div>
      </div>
    </div>
  );
}
