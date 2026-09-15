import { useMemo, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, QrCode } from "lucide-react";
import { QrAttendanceFlow } from "../components/QrAttendanceFlow";
import { useAsistenciaHoy } from "../hooks/useAsistencias";
import type { TipoOperacionQr } from "../types/asistencia.types";
import { extraerTokenQr } from "../utils/qrToken";
import { ErrorState, LoadingState, PageHeader } from "@/shared/components";
import { Alert, Button, Card, CardContent } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

export default function AsistenciaQrPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const asistenciaQuery = useAsistenciaHoy();
  const [flujoAbierto, setFlujoAbierto] = useState(true);
  const token = useMemo(
    () =>
      extraerTokenQr(
        searchParams.get("token") ?? searchParams.get("tokenQr") ?? "",
      ),
    [searchParams],
  );

  if (!token) {
    return <Navigate to="/mis-asistencias" replace />;
  }

  if (asistenciaQuery.isPending) {
    return (
      <Card>
        <LoadingState label="Cargando tu asistencia de hoy…" />
      </Card>
    );
  }

  if (asistenciaQuery.isError) {
    return (
      <Card>
        <ErrorState
          message={
            normalizeApiError(
              asistenciaQuery.error,
              "No pudimos cargar tu asistencia de hoy.",
            ).message
          }
          onRetry={() => void asistenciaQuery.refetch()}
        />
      </Card>
    );
  }

  const accion = asistenciaQuery.data?.accionDisponible;
  const tipo: TipoOperacionQr | undefined =
    accion === "REGISTRAR_INGRESO_QR"
      ? "ingreso"
      : accion === "REGISTRAR_EGRESO_QR"
        ? "egreso"
        : undefined;

  if (!asistenciaQuery.data || !tipo) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Registrar asistencia con QR"
          description="Validación del código QR de la obra."
        />
        <Card>
          <CardContent className="space-y-5 p-6">
            <Alert variant="warning">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>
                En este momento no tenés una acción de ingreso o egreso
                disponible para la asistencia de hoy.
              </span>
            </Alert>
            <Button onClick={() => navigate("/mis-asistencias", { replace: true })}>
              Ver Mis asistencias
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrar asistencia con QR"
        description="Revisá y confirmá la operación correspondiente a tu jornada de hoy."
      />
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
            <QrCode className="size-7" />
          </span>
          <div>
            <h2 className="font-semibold text-foreground">Código QR detectado</h2>
            <p className="mt-1 text-sm text-foreground-muted">
              Abrí la validación para continuar con el registro.
            </p>
          </div>
          <Button onClick={() => setFlujoAbierto(true)}>Continuar</Button>
        </CardContent>
      </Card>

      <QrAttendanceFlow
        tipo={tipo}
        open={flujoAbierto}
        initialToken={token}
        onOpenChange={(open) => {
          setFlujoAbierto(open);
          if (!open) navigate("/mis-asistencias", { replace: true });
        }}
        onSuccess={() => navigate("/mis-asistencias", { replace: true })}
      />
    </div>
  );
}
