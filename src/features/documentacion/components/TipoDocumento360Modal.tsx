import {
  Brain,
  CheckCircle2,
  Edit2,
  FileText,
  Globe,
  Lock,
  RotateCcw,
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
  onReactivar?: (tipo: TipoDocumentoDTO) => void;
}

export function TipoDocumento360Modal({
  tipo,
  open,
  onOpenChange,
  onEdit,
  onBaja,
  onReactivar,
}: TipoDocumento360ModalProps) {
  const user = useSessionStore((state) => state.user);
  const esAdmin = user?.rol === "ROLE_ADMIN";

  if (!tipo) return null;

  const isDadoDeBaja = Boolean(tipo.fechaBaja) || tipo.activo === false;

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
                {isDadoDeBaja ? (
                  <Badge variant="error">Desactivado / Dado de baja</Badge>
                ) : (
                  <Badge variant="success">Activo</Badge>
                )}
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
          {/* Alerta si está dado de baja */}
          {isDadoDeBaja && (
            <div className="rounded-lg border border-error/30 bg-error-soft px-4 py-3 text-xs text-error-strong">
              <strong>Estado:</strong> Este tipo de documento se encuentra actualmente desactivado o dado de baja.
              {tipo.fechaBaja ? ` Fecha de baja registrada: ${tipo.fechaBaja}` : ""}
            </div>
          )}

          {/* Descripción */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              <FileText className="size-4 text-primary" />
              Descripción y Alcance
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              {tipo.descripcion || "Sin descripción detallada."}
            </p>
          </div>

          {/* Grid de Reglas Técnicas */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Categoría de Ruteo */}
            <div className="space-y-1.5 rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                <Route className="size-4 text-primary" />
                Categoría de Ruteo
              </div>
              <p className="text-sm font-semibold text-foreground">
                {tipo.categoriaRuteo || "General"}
              </p>
              <p className="text-xs text-foreground-muted">
                Define la clasificación estructural del archivo en el sistema de gestión.
              </p>
            </div>

            {/* Visibilidad por Defecto */}
            <div className="space-y-1.5 rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                <Shield className="size-4 text-primary" />
                Visibilidad por Defecto
              </div>
              <p className="text-sm font-semibold text-foreground">
                {tipo.visibilidadDefecto || "PRIVADA"}
              </p>
              <p className="text-xs text-foreground-muted">
                Nivel de acceso predeterminado aplicado a los archivos que se carguen.
              </p>
            </div>
          </div>

          {/* Motor de IA / RAG */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                <Brain className="size-4 text-primary" />
                Integración RAG (Inteligencia Artificial)
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
            {esAdmin && !isDadoDeBaja && onBaja && (
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
            )}

            {esAdmin && isDadoDeBaja && onReactivar && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-success hover:bg-success-soft hover:text-success"
                onClick={() => {
                  onOpenChange(false);
                  onReactivar(tipo);
                }}
              >
                <RotateCcw className="mr-1.5 size-3.5" />
                Reactivar tipo
              </Button>
            )}
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
