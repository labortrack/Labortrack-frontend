import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Building2,
  Clock3,
  Expand,
  Minimize,
  QrCode,
  RefreshCw,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import { useAsegurarQrObra, useQrObra } from "../hooks/useObras";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { Alert, Button, Card, Spinner } from "@/shared/ui";

function formatearRestante(milisegundos: number) {
  const segundos = Math.max(0, Math.ceil(milisegundos / 1_000));
  const minutos = Math.floor(segundos / 60);
  const restoSegundos = segundos % 60;
  return `${minutos}:${restoSegundos.toString().padStart(2, "0")}`;
}

export default function ObraQrDisplayPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const obraId = Number(id);
  const idValido = Number.isInteger(obraId) && obraId > 0;
  const configuracionQuery = useAsegurarQrObra(idValido ? obraId : null);
  const qrQuery = useQrObra(
    idValido ? obraId : null,
    configuracionQuery.isSuccess,
  );
  const [ahora, setAhora] = useState<number | null>(null);
  const [pantallaCompleta, setPantallaCompleta] = useState(
    Boolean(document.fullscreenElement),
  );

  useEffect(() => {
    const inicio = window.setTimeout(() => setAhora(Date.now()), 0);
    const intervalo = window.setInterval(() => setAhora(Date.now()), 1_000);
    return () => {
      window.clearTimeout(inicio);
      window.clearInterval(intervalo);
    };
  }, []);

  useEffect(() => {
    const actualizar = () => setPantallaCompleta(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", actualizar);
    return () => document.removeEventListener("fullscreenchange", actualizar);
  }, []);

  const restante = useMemo(
    () =>
      ahora === null
        ? 0
        : Math.max(0, Date.parse(qrQuery.data?.venceEn ?? "") - ahora - 30_000),
    [ahora, qrQuery.data?.venceEn],
  );

  const alternarPantallaCompleta = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  };

  const reintentar = async () => {
    if (configuracionQuery.isError) {
      await configuracionQuery.refetch();
      return;
    }
    await qrQuery.refetch();
  };

  if (!idValido) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-page p-6">
        <Card className="max-w-lg space-y-4 p-8 text-center">
          <h1 className="text-xl font-semibold">Obra no válida</h1>
          <Button onClick={() => navigate("/obras")}>Volver a Obras</Button>
        </Card>
      </main>
    );
  }

  const cargando = configuracionQuery.isPending || qrQuery.isPending;
  const error = configuracionQuery.error ?? qrQuery.error;

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-page p-4 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute -left-40 -top-40 size-96 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -right-32 size-[32rem] rounded-full bg-primary/8 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => navigate(`/obras/${obraId}`)}>
          <ArrowLeft />
          <span className="hidden sm:inline">Volver a la obra</span>
        </Button>
        <div className="flex items-center gap-2">
          {qrQuery.isFetching && qrQuery.data ? (
            <span className="hidden items-center gap-2 text-sm text-foreground-muted sm:flex">
              <RefreshCw className="size-4 animate-spin" />
              Renovando QR…
            </span>
          ) : null}
          <Button variant="outline" onClick={() => void alternarPantallaCompleta()}>
            {pantallaCompleta ? <Minimize /> : <Expand />}
            <span className="hidden sm:inline">
              {pantallaCompleta ? "Salir de pantalla completa" : "Pantalla completa"}
            </span>
          </Button>
        </div>
      </header>

      <section className="relative z-10 flex flex-1 items-center justify-center py-6">
        {cargando ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <Spinner className="size-10 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">Preparando el QR de la obra</h1>
              <p className="mt-1 text-foreground-muted">Esto puede demorar unos segundos.</p>
            </div>
          </div>
        ) : error || !qrQuery.data ? (
          <Card className="w-full max-w-xl space-y-5 p-6 sm:p-8">
            <Alert variant="error">
              <WifiOff className="mt-0.5 size-5 shrink-0" />
              <span>
                {normalizeApiError(
                  error,
                  "No pudimos obtener el QR de esta obra.",
                ).message}
              </span>
            </Alert>
            <Button className="w-full" onClick={() => void reintentar()}>
              <RefreshCw />
              Reintentar
            </Button>
          </Card>
        ) : (
          <div className="grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)] lg:gap-14">
            <div className="text-center lg:text-left">
              <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg lg:mx-0">
                <QrCode className="size-8" />
              </span>
              <p className="mt-6 text-sm font-bold uppercase tracking-[0.22em] text-primary">
                Registro de asistencia
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Escaneá el código para registrar tu ingreso o egreso
              </h1>
              <div className="mt-6 flex items-center justify-center gap-3 text-lg font-semibold text-foreground lg:justify-start">
                <Building2 className="size-6 text-primary" />
                {qrQuery.data.nombreObra}
              </div>
              <div className="mt-8 grid gap-3 text-left sm:grid-cols-2 lg:max-w-xl">
                <div className="rounded-xl border border-border bg-card/85 p-4 shadow-sm">
                  <ShieldCheck className="size-5 text-success" />
                  <p className="mt-2 font-semibold">Código seguro y temporal</p>
                  <p className="mt-1 text-sm text-foreground-muted">
                    El sistema valida automáticamente que pertenezcas a esta obra.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card/85 p-4 shadow-sm">
                  <Clock3 className="size-5 text-primary" />
                  <p className="mt-2 font-semibold">Siempre actualizado</p>
                  <p className="mt-1 text-sm text-foreground-muted">
                    El código se renueva sin interrumpir la pantalla.
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[min(70vh,560px)]">
              <Card className="border-2 border-primary/15 bg-white p-4 shadow-xl sm:p-6">
                <div className="aspect-square w-full rounded-xl bg-white p-2 sm:p-4">
                  <QRCodeSVG
                    value={qrQuery.data.tokenQr}
                    size={1024}
                    level="M"
                    marginSize={2}
                    className="size-full"
                    title={`QR de asistencia de ${qrQuery.data.nombreObra}`}
                  />
                </div>
              </Card>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-foreground-muted">
                <Clock3 className="size-4" />
                Se renovará automáticamente en {formatearRestante(restante)}
              </div>
              <p className="mt-2 text-center text-sm text-foreground-muted">
                Abrí “Mis asistencias” en LaborTrack y apuntá la cámara a este código.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
