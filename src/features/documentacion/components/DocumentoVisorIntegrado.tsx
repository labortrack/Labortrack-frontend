import { ExternalLink, Eye } from "lucide-react";
import { Button } from "@/shared/ui";

interface DocumentoVisorIntegradoProps {
  url: string;
  titulo: string;
  contentType?: string;
  onClose: () => void;
}

export function DocumentoVisorIntegrado({ url, titulo, contentType, onClose }: DocumentoVisorIntegradoProps) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-3 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <Eye className="size-4 text-primary" aria-hidden="true" />
          Visor integrado de documento
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary-soft hover:underline">
            <ExternalLink className="size-3" aria-hidden="true" />Abrir en pestaña nueva
          </a>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-foreground-muted" onClick={onClose}>Cerrar visor</Button>
        </div>
      </div>
      <div className="relative h-[60dvh] min-h-64 w-full overflow-hidden rounded-md border border-border bg-muted/20">
        {contentType?.startsWith("image/") ?
          <img src={url} alt={titulo} className="h-full w-full object-contain" /> :
          <iframe src={url} title={`Visor de ${titulo}`} className="h-full w-full border-0" />}
      </div>
    </div>
  );
}
