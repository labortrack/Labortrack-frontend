import { Card, CardContent } from "@/shared/ui";
import { Users, Zap, Clock, ShieldCheck } from "lucide-react";
import type { CuadrillaResponseDto } from "../types/cuadrilla.types";

interface CuadrillaMetricsProps {
  cuadrillas: CuadrillaResponseDto[];
}

export function CuadrillaMetrics({ cuadrillas }: CuadrillaMetricsProps) {
  const totalCuadrillas = cuadrillas.length;
  const activas = cuadrillas.filter((c) => c.estadoActual === "ACTIVA").length;
  const enEsperaOPlanificadas = cuadrillas.filter(
    (c) => c.estadoActual === "EN_ESPERA" || c.estadoActual === "PLANIFICADA"
  ).length;
  const conLider = cuadrillas.filter((c) => c.lider != null).length;
  const totalOperarios = cuadrillas.reduce(
    (acc, curr) => acc + (curr.operariosCount ?? 0),
    0
  );

  const metrics = [
    {
      title: "Total Operarios Asignados",
      value: totalOperarios,
      subtitle: `En ${totalCuadrillas} cuadrilla${totalCuadrillas !== 1 ? "s" : ""}`,
      icon: Users,
      iconColor: "text-blue-500",
      bgGradient: "from-blue-500/10 via-blue-500/5 to-transparent",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Cuadrillas Activas",
      value: activas,
      subtitle: "En ejecución de obra",
      icon: Zap,
      iconColor: "text-emerald-500",
      bgGradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "En Espera / Planificadas",
      value: enEsperaOPlanificadas,
      subtitle: "Próximas a ingresar",
      icon: Clock,
      iconColor: "text-amber-500",
      bgGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Líderes Designados",
      value: `${conLider}/${totalCuadrillas}`,
      subtitle: "Capacitados y activos",
      icon: ShieldCheck,
      iconColor: "text-purple-500",
      bgGradient: "from-purple-500/10 via-purple-500/5 to-transparent",
      borderColor: "border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <Card
            key={idx}
            className={`relative overflow-hidden border bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow ${m.borderColor}`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${m.bgGradient} pointer-events-none`}
            />
            <CardContent className="p-4 sm:p-5 flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {m.title}
                </p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {m.value}
                </p>
                <p className="text-xs text-muted-foreground">{m.subtitle}</p>
              </div>
              <div
                className={`p-3 rounded-xl bg-background/80 shadow-xs border border-border/50 ${m.iconColor}`}
              >
                <Icon className="size-6" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
