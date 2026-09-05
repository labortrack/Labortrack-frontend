import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  ClipboardX,
  Clock3,
  LogOut,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type { ResumenParteDiarioResponseDto } from "../types/asistencia.types";
import { Card, CardContent } from "@/shared/ui";

interface ResumenParteDiarioProps {
  resumen: ResumenParteDiarioResponseDto;
}

export function ResumenParteDiario({ resumen }: ResumenParteDiarioProps) {
  const indicadores = [
    {
      label: "Total esperadas",
      value: resumen.totalEsperadas,
      icon: ClipboardCheck,
      style: "bg-primary-soft text-primary",
    },
    {
      label: "Pendientes de ingreso",
      value: resumen.pendientesIngreso,
      icon: Clock3,
      style: "bg-warning-soft text-warning",
    },
    {
      label: "Presentes / abiertas",
      value: resumen.presentes,
      icon: CheckCircle2,
      style: "bg-success-soft text-success",
    },
    {
      label: "Egresadas / cerradas",
      value: resumen.egresadas,
      icon: LogOut,
      style: "bg-primary-soft text-primary",
    },
    {
      label: "Ausentes",
      value: resumen.ausentes,
      icon: XCircle,
      style: "bg-error-soft text-error",
    },
    {
      label: "Ausencias justificadas",
      value: resumen.ausenciasJustificadas,
      icon: ShieldCheck,
      style: "bg-error-soft text-error-strong",
    },
    {
      label: "No trabajadas computables",
      value: resumen.noTrabajadasComputables,
      icon: ClipboardX,
      style: "bg-muted text-foreground-muted",
    },
    {
      label: "Anuladas",
      value: resumen.anuladas,
      icon: AlertCircle,
      style: "bg-muted text-foreground-muted",
    },
  ];

  return (
    <section aria-labelledby="resumen-parte-diario" className="space-y-3">
      <h2 id="resumen-parte-diario" className="text-base font-semibold">
        Resumen operativo
      </h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {indicadores.map(({ label, value, icon: Icon, style }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${style}`}
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <span className="block text-xs leading-4 text-foreground-muted">
                  {label}
                </span>
                <strong className="mt-0.5 block text-2xl font-semibold leading-7 text-foreground">
                  {value}
                </strong>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
