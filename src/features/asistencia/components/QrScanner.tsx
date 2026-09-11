import { useEffect, useRef, useState } from "react";
import {
  BrowserQRCodeReader,
  type IScannerControls,
} from "@zxing/browser";
import { AlertCircle, Camera, ScanLine } from "lucide-react";
import { Alert, Button, Spinner } from "@/shared/ui";
import { extraerTokenQr } from "../utils/qrToken";

interface QrScannerProps {
  onScan: (tokenQr: string) => void;
  onCancel: () => void;
}

function mensajeErrorCamara(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "No pudimos acceder a la cámara. Revisá el permiso del navegador e intentá nuevamente.";
    }
    if (error.name === "NotFoundError") {
      return "No encontramos una cámara disponible en este dispositivo.";
    }
    if (error.name === "NotReadableError") {
      return "La cámara está siendo utilizada por otra aplicación o no se encuentra disponible.";
    }
  }
  return "No pudimos iniciar la cámara. Verificá los permisos del dispositivo e intentá nuevamente.";
}

export function QrScanner({ onScan, onCancel }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | undefined>(undefined);
  const scanEntregadoRef = useRef(false);
  const [error, setError] = useState<string>();
  const [reinicio, setReinicio] = useState(0);

  useEffect(() => {
    let activo = true;
    scanEntregadoRef.current = false;

    const iniciar = async () => {
      if (!navigator.mediaDevices?.getUserMedia || !videoRef.current) {
        setError("Este navegador no permite acceder a la cámara.");
        return;
      }

      const lector = new BrowserQRCodeReader(undefined, {
        delayBetweenScanAttempts: 200,
        delayBetweenScanSuccess: 800,
      });

      try {
        const controls = await lector.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          videoRef.current,
          (resultado, _error, scannerControls) => {
            if (!activo || !resultado || scanEntregadoRef.current) return;

            const token = extraerTokenQr(resultado.getText());
            if (!token) return;

            scanEntregadoRef.current = true;
            scannerControls.stop();
            onScan(token);
          },
        );

        if (!activo) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
      } catch (cameraError) {
        if (activo) setError(mensajeErrorCamara(cameraError));
      }
    };

    void iniciar();
    return () => {
      activo = false;
      controlsRef.current?.stop();
      controlsRef.current = undefined;
    };
  }, [onScan, reinicio]);

  const reintentar = () => {
    controlsRef.current?.stop();
    controlsRef.current = undefined;
    setError(undefined);
    setReinicio((valor) => valor + 1);
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-black">
        <video
          ref={videoRef}
          className="size-full object-cover"
          muted
          playsInline
          aria-label="Vista previa de la cámara para escanear el código QR"
        />
        {!error ? (
          <>
            <div className="pointer-events-none absolute inset-[12%] rounded-xl border-2 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.34)]" />
            <ScanLine className="pointer-events-none absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-white/90" />
            <div className="absolute inset-x-0 bottom-4 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-black/65 px-3 py-2 text-xs font-medium text-white">
                <Spinner className="size-3.5 text-white" />
                Apuntá al QR de la obra
              </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-5">
            <Camera className="size-12 text-white/60" />
          </div>
        )}
      </div>

      {error ? (
        <Alert variant="error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </Alert>
      ) : (
        <p className="text-center text-sm text-foreground-muted">
          Mantené el código dentro del recuadro hasta que sea reconocido.
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        {error ? <Button onClick={reintentar}>Reintentar</Button> : null}
      </div>
    </div>
  );
}
