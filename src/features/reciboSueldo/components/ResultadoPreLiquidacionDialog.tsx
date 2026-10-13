import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ResultadoPreLiquidacion } from "../types/reciboSueldo.types";
import { formatFechaHora } from "@/features/periodoLiquidacion/utils/periodoLiquidacion";
import { InitialsAvatar } from "@/shared/components";
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui";
import { cn } from "@/shared/utils/cn";

/** Resumen de una corrida de pre-liquidación: la original o la que completa los faltantes. */
export function ResultadoPreLiquidacionDialog({
  resultado,
  onClose,
}: {
  resultado: ResultadoPreLiquidacion | null;
  onClose: () => void;
}) {
  const omitidos = resultado?.omitidos ?? [];

  return (
    <Dialog
      open={Boolean(resultado)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-success-soft text-success">
              <CheckCircle2 className="size-5" />
            </span>
            <div>
              <DialogTitle>Resultado de la pre-liquidación</DialogTitle>
              <DialogDescription>
                {resultado?.descripcionPeriodo} ·{" "}
                {formatFechaHora(resultado?.fechaEjecucion)} hs
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 text-center">
          <ResultadoDato
            label="Evaluados"
            value={resultado?.empleadosEvaluados ?? 0}
          />
          <ResultadoDato
            label="Recibos generados"
            value={resultado?.recibosGenerados ?? 0}
            className="text-success"
          />
          <ResultadoDato
            label="Omitidos"
            value={omitidos.length}
            className={omitidos.length > 0 ? "text-warning" : undefined}
          />
        </div>

        {omitidos.length > 0 ? (
          <div className="space-y-2">
            <Alert variant="warning">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              Estos empleados tuvieron asistencias en el período pero quedaron
              sin recibo por el motivo indicado.
            </Alert>
            <ul className="max-h-60 divide-y divide-border overflow-y-auto rounded-lg border border-border">
              {omitidos.map((omitido) => (
                <li
                  key={omitido.empleadoId}
                  className="flex items-start gap-2.5 p-3 text-sm"
                >
                  <InitialsAvatar name={omitido.apellidoNombre} />
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">
                      {omitido.apellidoNombre}
                    </p>
                    <p className="mt-0.5 text-foreground-muted">
                      {omitido.motivo}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <DialogFooter>
          <Button onClick={onClose}>Entendido</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResultadoDato({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-subtle p-3">
      <p className={cn("text-2xl font-bold text-foreground", className)}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-foreground-muted">{label}</p>
    </div>
  );
}
