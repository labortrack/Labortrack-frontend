import {
  Brain,
  CheckCircle2,
  Edit2,
  FileText,
  Globe,
  Lock,
  Route,
  Shield,
  Trash2,
} from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import type { TipoDocumentoDTO } from "../types/documentacion.types";

interface TipoDocumento360ModalProps {
  tipo: TipoDocumentoDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (tipo: TipoDocumentoDTO) => void;
  onBaja?: (tipo: TipoDocumentoDTO) => void;
}

export function TipoDocumento360Modal({
  tipo,
  open,
  onOpenChange,
  onEdit,
  onBaja,
}: TipoDocumento360ModalProps) {
  const user = useSessionStore((state) => state.user);
  const esAdmin = user?.rol === "ROLE_ADMIN";

  if (!tipo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0">
        {/* ── Encabezado 360 ── */}
        <div className="border-b border-border bg-card px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <FileText className="size-6" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutral" className="font-mono text-xs">
                  TIPO #{tipo.idTipoDocumento}
                </Badge>
                <Badge variant="neutral">
                  {tipo.categoriaRuteo || "General"}
                </Badge>
                {tipo.procesarEnRag ? (
                  <Badge variant="primary">
                    <Brain className="mr-1 size-3" />
                    RAG Habilitado
                  </Badge>
                ) : (
                  <Badge variant="neutral" className="text-foreground-muted">
                    Sin RAG
                  </Badge>
                )}
                <Badge
                  variant="neutral"
                  className="flex items-center gap-1 text-xs"
                >
                  {tipo.visibilidadDefecto?.toUpperCase() === "PUBLICA" ? (
                    <Globe className="size-3" />
                  ) : (
                    <Lock className="size-3" />
                  )}
                  {tipo.visibilidadDefecto || "PRIVADA"}
                </Badge>
              </div>

              <DialogTitle className="text-xl font-bold leading-tight">
                {tipo.nombre}
              </DialogTitle>
              <DialogDescription className="text-xs text-foreground-muted">
                Configuración y reglas de negocio para este tipo de documento.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* ── Contenido 360° ── */}
        <div className="space-y-4 px-6 py-5">
          {/* Descripción */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              <FileText className="size-4 text-primary" />
              Descripción y Alcance
            </div>
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {tipo.descripcion || "Sin descripción detallada especificada."}
            </p>
          </div>

          {/* Grid: Ruteo y Visibilidad */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Categoría de Ruteo */}
            <div className="space-y-2 rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                <Route className="size-4 text-primary" />
                Categoría de Ruteo
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-foreground">
                  {tipo.categoriaRuteo || "No definida"}
                </span>
                <p className="text-xs text-foreground-muted">
                  Determina el flujo y la clasificación de almacenamiento dentro de la organización.
                </p>
              </div>
            </div>

            {/* Visibilidad por Defecto */}
            <div className="space-y-2 rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                <Shield className="size-4 text-primary" />
                Visibilidad por Defecto
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-foreground">
                  {tipo.visibilidadDefecto || "PRIVADA"}
                </span>
                <p className="text-xs text-foreground-muted">
                  Nivel de acceso inicial aplicado automáticamente a los nuevos documentos subidos.
                </p>
              </div>
            </div>
          </div>

          {/* Reglas de IA & Procesamiento RAG */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                <Brain className="size-4 text-primary" />
                Indexación e Inteligencia Artificial (RAG)
              </div>
              {tipo.procesarEnRag ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <CheckCircle2 className="size-3" /> Habilitado
                </span>
              ) : (
                <span className="text-xs text-foreground-muted">Deshabilitado</span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-foreground-muted">
              {tipo.procesarEnRag
                ? "Los documentos de este tipo serán enviados automáticamente al pipeline de embedding y vectorización RAG tras su carga. Los usuarios podrán realizar búsquedas inteligentes por contenido en lenguaje natural."
                : "Los documentos asociados a este tipo no se procesarán con modelos de IA ni se generarán embeddings semánticos."}
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-border bg-card px-6 py-4">
          <div>
            {esAdmin && onBaja ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-error hover:bg-error-soft hover:text-error"
                onClick={() => {
                  onOpenChange(false);
                  onBaja(tipo);
                }}
              >
                <Trash2 className="mr-1.5 size-3.5" />
                Dar de baja tipo
              </Button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
            {esAdmin && onEdit && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(tipo);
                }}
              >
                <Edit2 className="mr-1.5 size-3.5" />
                Editar tipo
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
