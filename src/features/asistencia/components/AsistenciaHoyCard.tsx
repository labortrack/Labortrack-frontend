import { useState } from "react";
import {
  Building2,
  CalendarDays,
  Clock3,
  MapPin,
  QrCode,
  Users,
} from "lucide-react";
import { Button, Card, CardContent } from "@/shared/ui";
import type { AsistenciaHoyResponseDto } from "../types/asistencia.types";
import {
  formatFecha,
  formatHora,
  formatUbicacionObra,
  TIPO_JORNADA_LABELS,
} from "../utils/asistenciaFormatters";
import { AsistenciaInfoItem } from "./AsistenciaInfoItem";
import { AsistenciaStatusBadge } from "./AsistenciaStatusBadge";
import { RegistroAsistenciaCard } from "./RegistroAsistenciaCard";
import { QrAttendanceFlow } from "./QrAttendanceFlow";
import type { TipoOperacionQr } from "../types/asistencia.types";

interface AsistenciaHoyCardProps {
  asistencia: AsistenciaHoyResponseDto;
}

export function AsistenciaHoyCard({ asistencia }: AsistenciaHoyCardProps) {
  const [operacionQr, setOperacionQr] = useState<TipoOperacionQr>();
  const accion = (() => {
    switch (asistencia.accionDisponible) {
      case "REGISTRAR_INGRESO_QR":
        return "Registrar ingreso con QR";
      case "REGISTRAR_EGRESO_QR":
        return "Registrar egreso con QR";
      case "NINGUNA":
        return null;
    }
  })();

  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 bg-primary" />
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {formatFecha(asistencia.fecha)}
          </h3>
          <AsistenciaStatusBadge estado={asistencia.estado} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AsistenciaInfoItem
            icon={Building2}
            label="Obra"
            value={asistencia.obra.nombre}
          />
          <AsistenciaInfoItem
            icon={MapPin}
            label="Ubicación"
            value={formatUbicacionObra(asistencia.obra)}
          />
          <AsistenciaInfoItem
            icon={Users}
            label="Cuadrilla"
            value={asistencia.cuadrilla}
          />
          <AsistenciaInfoItem
            icon={CalendarDays}
            label="Tipo de jornada"
            value={TIPO_JORNADA_LABELS[asistencia.tipoJornada]}
          />
          <AsistenciaInfoItem
            icon={Clock3}
            label="Horario planificado"
            value={`${formatHora(asistencia.horaInicioPlanificada)} a ${formatHora(
              asistencia.horaFinPlanificada,
            )}`}
          />
        </div>

        <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
          <RegistroAsistenciaCard
            tipoRegistro="ingreso"
            registro={asistencia.ingreso}
          />
          <RegistroAsistenciaCard
            tipoRegistro="egreso"
            registro={asistencia.egreso}
          />
        </div>

        {accion ? (
          <div className="flex justify-end border-t border-border pt-5">
            <Button
              className="w-full sm:w-auto"
              onClick={() =>
                setOperacionQr(
                  asistencia.accionDisponible === "REGISTRAR_INGRESO_QR"
                    ? "ingreso"
                    : "egreso",
                )
              }
            >
              <QrCode />
              {accion}
            </Button>
          </div>
        ) : null}
      </CardContent>
      {operacionQr ? (
        <QrAttendanceFlow
          tipo={operacionQr}
          open
          onOpenChange={(open) => {
            if (!open) setOperacionQr(undefined);
          }}
        />
      ) : null}
    </Card>
  );
}
