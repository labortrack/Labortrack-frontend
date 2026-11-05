import { QRCodeSVG } from "qrcode.react";
import { Expand, QrCode, WifiOff } from "lucide-react";
import { Alert, Button, Card } from "@/shared/ui";
import type { QrObraResponseDto } from "@/features/obra/types/obra.types";
import { useQrClock } from "../hooks/useQrClock";
import { segundosRestantes } from "../utils/qrTime";
export function QrDisplay({ qr, nombre, error, onRetry }: {
  qr?: QrObraResponseDto; nombre?: string; error?: string; onRetry: () => void;
}) {
  const now = useQrClock();
  const segundos = qr ? segundosRestantes(qr.venceEn, now) : 0;
  const vigente = segundos > 0;
  const url = new URL("/asistencias/qr", window.location.origin);
  if (qr) url.searchParams.set("token", qr.tokenQr);
  return <main className="flex h-dvh flex-col items-center gap-6 overflow-y-auto bg-page p-5 text-center sm:p-10">
    <div className="flex w-full max-w-4xl shrink-0 items-center justify-between gap-3">
      <span className="flex items-center gap-2 font-semibold text-primary"><QrCode /> LaborTrack</span>
      <Button variant="outline" aria-label="Pantalla completa" onClick={() => {
        const action = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
        void action.catch(() => undefined);
      }}><Expand /><span className="hidden sm:inline">Pantalla completa</span></Button>
    </div>
    <div><h1 className="text-3xl font-bold">{qr?.nombreObra ?? "Registro de asistencia"}</h1>
      {nombre && <p className="mt-2 text-foreground-muted">{nombre}</p>}
      <p className="mt-3">Escaneá el QR desde “Mis asistencias” para registrar tu ingreso o egreso.</p></div>
    {(error || !navigator.onLine) && <Alert variant="warning" className="max-w-xl"><WifiOff className="shrink-0" />{!navigator.onLine ? "Sin conexión. El código se ocultará cuando venza." : error}</Alert>}
    {vigente ? <Card className="w-full max-w-[min(58vh,480px)] shrink-0 bg-white p-5 shadow-xl">
      <QRCodeSVG value={url.toString()} size={800} marginSize={3} className="h-auto w-full" title="QR de asistencia de la obra" />
    </Card> : <Card className="flex min-h-64 w-full max-w-lg shrink-0 flex-col items-center justify-center gap-4 p-8">
      <WifiOff className="size-10 text-foreground-muted" />
      <p>{error || !navigator.onLine ? "No hay un QR vigente. Esperando conexión para actualizarlo." : "Obteniendo un nuevo QR…"}</p>
      <Button variant="outline" onClick={onRetry}>Reintentar</Button>
    </Card>}
    <p className="text-sm text-foreground-muted">{vigente ? `Código válido por ${segundos} segundos. Se renueva automáticamente.` : "Los códigos vencidos no permiten registrar asistencia."}</p>
  </main>;
}
