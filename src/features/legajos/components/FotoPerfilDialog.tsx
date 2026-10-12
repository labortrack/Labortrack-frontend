import { X } from "lucide-react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui";

interface FotoPerfilDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl?: string;
  nombre: string;
  tieneError?: boolean;
  onError?: () => void;
  onRetryManual?: () => void;
}

export function FotoPerfilDialog({
  open,
  onOpenChange,
  imageUrl,
  nombre,
  tieneError = false,
  onError,
  onRetryManual,
}: FotoPerfilDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="z-[60] bg-black/75 backdrop-blur-xs"
        className="z-[60] max-w-2xl border-border bg-card p-4 sm:p-6 shadow-floating [&>button:last-child]:hidden"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Foto de perfil de {nombre}</DialogTitle>
          <DialogDescription>
            Visualización ampliada de la foto de perfil de {nombre}
          </DialogDescription>
        </DialogHeader>

        {/* Barra superior con título y botón de cerrar con área táctil >= 44px */}
        <div className="flex w-full items-center justify-between border-b border-border/60 pb-2">
          <span className="truncate text-sm font-medium text-foreground max-w-[calc(100%-52px)]">
            Foto de perfil · {nombre}
          </span>
          <DialogClose
            aria-label="Cerrar visor de foto de perfil"
            className="flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-foreground-muted transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
          >
            <X className="size-5" />
          </DialogClose>
        </div>

        {/* Contenedor de la foto sin distorsión ni recorte */}
        <div className="relative flex min-h-[200px] max-h-[80vh] w-full items-center justify-center overflow-hidden pt-2">
          {tieneError || !imageUrl ? (
            <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-sm text-foreground-muted">
                No se pudo cargar la imagen ampliada. Es posible que el enlace haya expirado.
              </p>
              {onRetryManual && (
                <Button variant="outline" size="sm" onClick={onRetryManual}>
                  Reintentar
                </Button>
              )}
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={`Foto de perfil ampliada de ${nombre}`}
              className="max-h-[75vh] max-w-full w-auto h-auto rounded-md object-contain shadow-soft"
              onError={onError}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
