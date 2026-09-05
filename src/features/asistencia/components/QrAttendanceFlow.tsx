import { useCallback, useState } from "react";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  LogIn,
  LogOut,
  MapPin,
  QrCode,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useConfirmarAsistenciaQr, useValidarAsistenciaQr } from "../hooks/useAsistencias";
import type {
  ConfirmacionEgresoQrResponseDto,
  ConfirmacionQrResponseDto,
  TipoOperacionQr,
} from "../types/asistencia.types";
import {
  ESTADO_ASISTENCIA_LABELS,
  formatFecha,
  formatFechaHora,
  formatHora,
  formatUbicacionObra,
} from "../utils/asistenciaFormatters";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Spinner,
} from "@/shared/ui";
import { QrScanner } from "./QrScanner";

type PasoFlujo =
  | "introduccion"
  | "scanner"
  | "validando"
  | "error-validacion"
  | "confirmacion";

interface QrAttendanceFlowProps {
  tipo: TipoOperacionQr;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialToken?: string;
  onSuccess?: () => void;
}

function esConfirmacionEgreso(
  confirmacion: ConfirmacionQrResponseDto,
): confirmacion is ConfirmacionEgresoQrResponseDto {
  return "fechaHoraIngreso" in confirmacion;
}

function DatoConfirmacion({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-foreground-muted" />
      <div className="min-w-0">
        <span className="block text-xs font-medium text-foreground-muted">
          {label}
        </span>
        <span className="mt-0.5 block text-sm font-semibold text-foreground">
          {value}
        </span>
      </div>
    </div>
  );
}

export function QrAttendanceFlow({
  tipo,
  open,
  onOpenChange,
  initialToken,
  onSuccess,
}: QrAttendanceFlowProps) {
  const [paso, setPaso] = useState<PasoFlujo>("introduccion");
  const [tokenQr, setTokenQr] = useState(initialToken ?? "");
  const [confirmacion, setConfirmacion] =
    useState<ConfirmacionQrResponseDto>();
  const [mensajeError, setMensajeError] = useState<string>();
  const validarMutation = useValidarAsistenciaQr(tipo);
  const confirmarMutation = useConfirmarAsistenciaQr(tipo);
  const esIngreso = tipo === "ingreso";

  const cerrar = useCallback(() => {
    if (validarMutation.isPending || confirmarMutation.isPending) return;
    onOpenChange(false);
    setPaso("introduccion");
    setTokenQr(initialToken ?? "");
    setConfirmacion(undefined);
    setMensajeError(undefined);
    validarMutation.reset();
    confirmarMutation.reset();
  }, [
    confirmarMutation,
    initialToken,
    onOpenChange,
    validarMutation,
  ]);

  const validarToken = useCallback(
    async (token: string) => {
      setTokenQr(token);
      setPaso("validando");
      setMensajeError(undefined);
      try {
        const datos = await validarMutation.mutateAsync({ tokenQr: token });
        setConfirmacion(datos);
        setPaso("confirmacion");
      } catch (error) {
        setMensajeError(
          normalizeApiError(
            error,
            "No pudimos validar el código QR. Intentá escanearlo nuevamente.",
          ).message,
        );
        setPaso("error-validacion");
      }
    },
    [validarMutation],
  );

  const confirmar = async () => {
    if (!confirmacion) return;
    setMensajeError(undefined);
    try {
      await confirmarMutation.mutateAsync({
        tokenQr,
        asistenciaId: confirmacion.asistenciaId,
      });
      toast.success(
        esIngreso
          ? "Ingreso registrado correctamente."
          : "Egreso registrado correctamente.",
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const normalizado = normalizeApiError(
        error,
        esIngreso
          ? "No pudimos registrar el ingreso."
          : "No pudimos registrar el egreso.",
      );
      setMensajeError(normalizado.message);
    }
  };

  const volverAEscanear = () => {
    validarMutation.reset();
    confirmarMutation.reset();
    setConfirmacion(undefined);
    setMensajeError(undefined);
    setTokenQr("");
    setPaso("scanner");
  };

  const titulo = esIngreso ? "Registrar ingreso con QR" : "Registrar egreso con QR";
  const IconoOperacion = esIngreso ? LogIn : LogOut;

  return (
    <Dialog open={open} onOpenChange={(nuevoOpen) => !nuevoOpen && cerrar()}>
      <DialogContent className={paso === "scanner" ? "max-w-xl" : undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
              {paso === "scanner" ? (
                <Camera className="size-5" />
              ) : (
                <IconoOperacion className="size-5" />
              )}
            </span>
            {paso === "scanner" ? "Escanear QR de la obra" : titulo}
          </DialogTitle>
          <DialogDescription>
            {paso === "introduccion"
              ? `Vamos a abrir la cámara para validar la obra y registrar tu ${tipo}.`
              : paso === "scanner"
                ? "Enfocá el código QR vigente que se encuentra en la obra."
                : paso === "confirmacion"
                  ? `Revisá los datos antes de confirmar el ${tipo}.`
                  : "Estamos comprobando el código con LaborTrack."}
          </DialogDescription>
        </DialogHeader>

        {paso === "introduccion" ? (
          <>
            <div className="space-y-4">
              <div className="flex items-start gap-4 rounded-card border border-primary/20 bg-primary-soft p-4">
                <QrCode className="mt-0.5 size-7 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">
                    Necesitamos acceso a la cámara
                  </p>
                  <p className="mt-1 text-sm leading-5 text-foreground-muted">
                    El navegador solicitará permiso para usarla. La imagen se
                    procesa en el dispositivo y solo enviaremos el token leído
                    para validarlo con el servidor.
                  </p>
                </div>
              </div>
              <p className="text-sm text-foreground-muted">
                La asistencia no cambiará hasta que revises los datos y pulses
                “Confirmar {tipo}”.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={cerrar}>
                Cancelar
              </Button>
              <Button
                onClick={() =>
                  initialToken
                    ? void validarToken(initialToken)
                    : setPaso("scanner")
                }
              >
                {initialToken ? <QrCode /> : <Camera />}
                {initialToken ? "Validar QR" : "Abrir cámara"}
              </Button>
            </DialogFooter>
          </>
        ) : null}

        {paso === "scanner" ? (
          <QrScanner onScan={validarToken} onCancel={cerrar} />
        ) : null}

        {paso === "validando" ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
            <Spinner className="size-8 text-primary" />
            <p className="font-semibold text-foreground">Validando código QR…</p>
            <p className="max-w-sm text-sm text-foreground-muted">
              Estamos comprobando que corresponda a tu obra y a la asistencia
              esperada de hoy.
            </p>
          </div>
        ) : null}

        {paso === "error-validacion" ? (
          <>
            <Alert variant="error">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{mensajeError}</span>
            </Alert>
            <DialogFooter>
              <Button variant="outline" onClick={cerrar}>
                Cancelar
              </Button>
              <Button onClick={volverAEscanear}>
                <QrCode />
                Escanear nuevamente
              </Button>
            </DialogFooter>
          </>
        ) : null}

        {paso === "confirmacion" && confirmacion ? (
          <>
            <div className="space-y-5">
              <Alert variant="success">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                <span>El QR fue validado correctamente.</span>
              </Alert>

              <div className="grid gap-4 rounded-card border border-border bg-subtle p-4 sm:grid-cols-2">
                <DatoConfirmacion
                  icon={Building2}
                  label="Obra"
                  value={confirmacion.obra.nombre}
                />
                <DatoConfirmacion
                  icon={MapPin}
                  label="Ubicación"
                  value={formatUbicacionObra(confirmacion.obra)}
                />
                <DatoConfirmacion
                  icon={UserRound}
                  label="Trabajador"
                  value={confirmacion.trabajador}
                />
                <DatoConfirmacion
                  icon={Users}
                  label="Cuadrilla"
                  value={confirmacion.cuadrilla}
                />
                <DatoConfirmacion
                  icon={CalendarDays}
                  label="Fecha"
                  value={formatFecha(confirmacion.fecha)}
                />
                <DatoConfirmacion
                  icon={Clock3}
                  label="Hora de validación"
                  value={formatFechaHora(confirmacion.fechaHoraValidacion)}
                />
                <DatoConfirmacion
                  icon={IconoOperacion}
                  label="Estado actual"
                  value={ESTADO_ASISTENCIA_LABELS[confirmacion.estadoActual]}
                />
                {esConfirmacionEgreso(confirmacion) ? (
                  <DatoConfirmacion
                    icon={LogIn}
                    label="Ingreso registrado"
                    value={formatHora(confirmacion.fechaHoraIngreso)}
                  />
                ) : null}
              </div>

              {mensajeError ? (
                <Alert variant="error">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{mensajeError}</span>
                </Alert>
              ) : null}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={cerrar}
                disabled={confirmarMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => void confirmar()}
                disabled={confirmarMutation.isPending}
              >
                {confirmarMutation.isPending ? (
                  <Spinner className="text-white" />
                ) : (
                  <IconoOperacion />
                )}
                {confirmarMutation.isPending
                  ? `Registrando ${tipo}…`
                  : `Confirmar ${tipo}`}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
