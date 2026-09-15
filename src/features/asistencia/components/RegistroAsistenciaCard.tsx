import { ClipboardList, LogIn, LogOut, QrCode } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { RegistroAsistenciaResponseDto } from "../types/asistencia.types";
import {
  formatHora,
  TIPO_ASISTENCIA_LABELS,
} from "../utils/asistenciaFormatters";

interface RegistroAsistenciaCardProps {
  tipoRegistro: "ingreso" | "egreso";
  registro: RegistroAsistenciaResponseDto | null;
}

export function RegistroAsistenciaCard({
  tipoRegistro,
  registro,
}: RegistroAsistenciaCardProps) {
  const esIngreso = tipoRegistro === "ingreso";
  const IconoRegistro = esIngreso ? LogIn : LogOut;
  const IconoTipo = registro?.tipo === "QR" ? QrCode : ClipboardList;

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        registro
          ? esIngreso
            ? "border-success/20 bg-success-soft"
            : "border-primary/20 bg-primary-soft"
          : "border-border bg-subtle",
      )}
    >
      <div
        className={cn(
          "mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide",
          registro
            ? esIngreso
              ? "text-success"
              : "text-primary"
            : "text-foreground-muted",
        )}
      >
        <IconoRegistro className="size-4" />
        {esIngreso ? "Ingreso" : "Egreso"}
      </div>

      {registro ? (
        <div className="flex items-end justify-between gap-3">
          <div>
            <span className="block text-xs text-foreground-muted">Hora</span>
            <span className="text-xl font-semibold text-foreground">
              {formatHora(registro.fechaHora)}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-current/15 bg-card px-2.5 py-1 text-xs font-semibold text-foreground-muted">
            <IconoTipo className="size-3.5" />
            {TIPO_ASISTENCIA_LABELS[registro.tipo]}
          </span>
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          <div>
            <span className="block text-xs text-foreground-muted">Hora</span>
            <span className="text-foreground-muted">Sin registrar</span>
          </div>
          <div>
            <span className="block text-xs text-foreground-muted">Tipo</span>
            <span className="text-foreground-muted">Sin registrar</span>
          </div>
        </div>
      )}
    </div>
  );
}
