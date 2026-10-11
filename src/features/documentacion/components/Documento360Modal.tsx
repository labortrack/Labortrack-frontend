import { useState } from "react";
import { DocumentoVisorIntegrado } from "./DocumentoVisorIntegrado";
import {
  AlertCircle,
  Brain,
  Calendar,
  Eye,
  EyeOff,
  FileCode,
  FileSpreadsheet,
  FileText,
  Globe,
  Layers,
  Loader2,
  Lock,
  Sparkles,
  Trash2,
  User,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  Alert,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Spinner,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { documentacionApi } from "../api/documentacionApi";
import { useObtenerUrlVisor } from "../hooks/useDocumentacion";
import { useRagIndexingPolling } from "../hooks/useRagIndexingPolling";
import type { DocumentoRespuestaDto } from "../types/documentacion.types";

interface Documento360ModalProps {
  doc: DocumentoRespuestaDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBaja?: (doc: DocumentoRespuestaDto) => void;
  onReindexar?: (doc: DocumentoRespuestaDto) => void;
}

function formatFechaCompleta(iso: string) {
  try {
    const fecha = new Date(iso);
    if (isNaN(fecha.getTime())) return iso;
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(fecha);
  } catch {
    return iso;
  }
}

function getFileIcon(contentType: string, nombre: string) {
  const ct = contentType?.toLowerCase() || "";
  const name = nombre?.toLowerCase() || "";

  if (ct.includes("pdf") || name.endsWith(".pdf")) {
    return <FileText className="size-6 text-red-500" />;
  }
  if (ct.includes("image") || name.match(/\.(png|jpe?g|webp|gif|svg)$/)) {
    return <FileCode className="size-6 text-blue-500" />;
  }
  if (ct.includes("sheet") || ct.includes("excel") || name.match(/\.(xlsx?|csv)$/)) {
    return <FileSpreadsheet className="size-6 text-emerald-500" />;
  }
  return <FileText className="size-6 text-primary" />;
}

function isPreviewableFormat(contentType?: string, nombreArchivo?: string): boolean {
  const ct = contentType?.toLowerCase() || "";
  const name = nombreArchivo?.toLowerCase() || "";

  const isPdf = ct.includes("pdf") || name.endsWith(".pdf");
  const isImage =
    ct.startsWith("image/") ||
    ct.includes("jpeg") ||
    ct.includes("jpg") ||
    ct.includes("png") ||
    ct.includes("webp") ||
    ct.includes("gif") ||
    ct.includes("svg") ||
    Boolean(name.match(/\.(png|jpe?g|webp|gif|svg)$/i));

  return isPdf || isImage;
}

export function Documento360Modal({
  doc,
  open,
  onOpenChange,
  onBaja,
  onReindexar,
}: Documento360ModalProps) {
  // Estados de visualización
  const [visorUrl, setVisorUrl] = useState<string | null>(null);
  const [incompatibleNotice, setIncompatibleNotice] = useState<string | null>(null);
  const [reindexarConfirmOpen, setReindexarConfirmOpen] = useState(false);
  const [isReindexando, setIsReindexando] = useState(false);
  const { iniciarPolling } = useRagIndexingPolling();

  const obtenerUrlVisorMutation = useObtenerUrlVisor();

  const user = useSessionStore((state) => state.user);
  const esOperario = user?.rol === "ROLE_OPERARIO";
  const esAdmin = user?.rol === "ROLE_ADMIN";
  const puedeEliminar = esAdmin;

  const handleConfirmarReindexar = async () => {
    if (!doc) return;
    setIsReindexando(true);
    try {
      await documentacionApi.reindexarDocumento(doc.idDocumento);
      iniciarPolling(doc);
      onReindexar?.(doc);
      setReindexarConfirmOpen(false);
    } catch (error) {
      toast.error(
        normalizeApiError(error, "No se pudo iniciar la reindexación.").message,
      );
    } finally {
      setIsReindexando(false);
    }
  };

  // Resetear preview cuando cambia el documento o se abre/cierra el modal
  const [prevDocKey, setPrevDocKey] = useState<string | null>(null);
  const currentDocKey = open && doc ? `${doc.idDocumento}` : null;

  if (currentDocKey !== prevDocKey) {
    setPrevDocKey(currentDocKey);
    setVisorUrl(null);
    setIncompatibleNotice(null);
  }

  if (!doc) return null;

  const estadoRagEfectivo =
    doc.estadoRag ?? (doc.esIndexadoRag ? "INDEXADO" : "SIN_INDEXAR");

  const esDocumentoPublico =
    doc.visibilidad?.toUpperCase() === "PUBLICO" ||
    doc.visibilidad?.toUpperCase() === "PUBLICA" ||
    (!doc.empleadoId && !doc.empleadoNombreCompleto);

  const handleAbrirOPrevisualizar = async () => {
    // 1. Evaluar previamente el tipo MIME para no llamar al visor si es incompatible
    const compatible = isPreviewableFormat(doc.contentType, doc.nombreArchivoOriginal);

    if (!compatible) {
      setVisorUrl(null);
      setIncompatibleNotice(
        "La vista previa nativa no está disponible para este formato. Podés descargarlo o consultarlo con tu administrador.",
      );
      return;
    }

    try {
      // 2. Obtener la URL prefirmada de MinIO que retorna el backend
      const url = await obtenerUrlVisorMutation.mutateAsync(doc.idDocumento);

      if (!url) {
        toast.error("No se pudo obtener la URL de visualización del archivo.");
        return;
      }

      setIncompatibleNotice(null);
      setVisorUrl(url);
    } catch {
      toast.error("Error al obtener la URL del archivo para visualización.");
    }
  };

  const handleCerrarVisor = () => {
    setVisorUrl(null);
    setIncompatibleNotice(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 transition-all duration-200">
          {/* ── Encabezado 360 ── */}
          <div className="border-b border-border bg-card px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
                {getFileIcon(doc.contentType, doc.nombreArchivoOriginal)}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral" className="font-mono text-xs">
                    DOC #{doc.idDocumento}
                  </Badge>
                  <Badge variant="neutral">
                    {doc.tipoDocumentoNombre || "General"}
                  </Badge>
                  {doc.fechaBaja && (
                    <Badge variant="error">
                      Inactivo
                    </Badge>
                  )}
                  {esAdmin && (
                    estadoRagEfectivo === "INDEXADO" ? (
                      <Badge variant="primary">
                        <Brain className="mr-1 size-3" />
                        IA Indexado (RAG)
                      </Badge>
                    ) : estadoRagEfectivo === "INDEXANDO" ? (
                      <Badge variant="primary">
                        <Loader2 className="mr-1 size-3 animate-spin text-primary" />
                        Indexando IA…
                      </Badge>
                    ) : estadoRagEfectivo === "SIN_INDEXAR" ? (
                      <Badge variant="warning">
                        Sin indexar
                      </Badge>
                    ) : null
                  )}
                <Badge
                  variant="neutral"
                  className="flex items-center gap-1 text-xs"
                >
                  {esDocumentoPublico ? (
                    <Globe className="size-3 text-primary" />
                  ) : (
                    <Lock className="size-3 text-foreground-muted" />
                  )}
                  {doc.visibilidad || (esDocumentoPublico ? "PUBLICO" : "PRIVADO")}
                </Badge>
              </div>

              <DialogTitle className="text-xl font-bold leading-tight">
                {doc.nombreDocumento}
              </DialogTitle>
              <DialogDescription className="truncate text-xs font-mono text-foreground-muted">
                Archivo: {doc.nombreArchivoOriginal}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* ── Contenido de la Vista 360° ── */}
        <div className="space-y-5 px-6 py-5">
          {/* Barra de Acciones Directas */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <Eye className="size-4 text-primary" />
              <span>Visualización de archivo:</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={visorUrl ? "secondary" : "outline"}
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={visorUrl ? handleCerrarVisor : handleAbrirOPrevisualizar}
                disabled={obtenerUrlVisorMutation.isPending}
              >
                {obtenerUrlVisorMutation.isPending ? (
                  <>
                    <Spinner className="size-3.5" />
                    <span>Cargando visor...</span>
                  </>
                ) : visorUrl ? (
                  <>
                    <EyeOff className="size-3.5" />
                    <span>Ocultar visor</span>
                  </>
                ) : (
                  <>
                    <Eye className="size-3.5" />
                    <span>Abrir Visor</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Aviso de formato no previsualizable */}
          {incompatibleNotice && (
            <Alert variant="warning" className="animate-in fade-in-50 text-xs">
              <AlertCircle className="size-4 shrink-0" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Formato no integrable en visor</span>
                <span>{incompatibleNotice}</span>
              </div>
            </Alert>
          )}

          {/* Visor nativo integrado (PDF / Imágenes) */}
          {visorUrl && (
            <DocumentoVisorIntegrado url={visorUrl} titulo={doc.nombreDocumento} contentType={doc.contentType} onClose={handleCerrarVisor} />
          )}

          {/* ── VISTA PARA OPERARIOS (Clara, contextual y sin ruido técnico) ── */}
          {esOperario ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {esDocumentoPublico ? (
                <>
                  {/* Tarjeta 1: Alcance Institucional */}
                  <div className="space-y-1.5 rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      <Globe className="size-4 text-primary" />
                      Alcance del documento
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      Documento Institucional / Público
                    </p>
                    <p className="text-xs text-foreground-muted">
                      Normativa o información accesible para todo el personal.
                    </p>
                  </div>

                  {/* Tarjeta 2: Fecha de Publicación */}
                  <div className="space-y-1.5 rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      <Calendar className="size-4 text-primary" />
                      Fecha de publicación
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {doc.fechaSubida ? formatFechaCompleta(doc.fechaSubida) : "Disponible"}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      Clasificación: {doc.tipoDocumentoNombre || "General"}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Tarjeta 1: Titular del Legajo */}
                  <div className="space-y-1.5 rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      <User className="size-4 text-primary" />
                      Titular del Documento
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {doc.empleadoNombreCompleto || "Mi Legajo Personal"}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      {doc.empleadoDni ? `DNI: ${doc.empleadoDni}` : "Documentación personal asociada"}
                    </p>
                  </div>

                  {/* Tarjeta 2: Fecha de Subida */}
                  <div className="space-y-1.5 rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      <Calendar className="size-4 text-primary" />
                      Fecha de registro
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {doc.fechaSubida ? formatFechaCompleta(doc.fechaSubida) : "—"}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      Tipo: {doc.tipoDocumentoNombre || "General"}
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* ── VISTA PARA GESTIÓN (ROLE_ADMIN / ROLE_RRHH) ── */
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Metadato: Empleado Asociado o Clasificación */}
                <div className="space-y-1.5 rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    {esDocumentoPublico ? (
                      <Globe className="size-4 text-primary" />
                    ) : (
                      <User className="size-4 text-primary" />
                    )}
                    {esDocumentoPublico ? "Clasificación" : "Empleado / Titular"}
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {esDocumentoPublico
                      ? "Documento Institucional / Público"
                      : doc.empleadoNombreCompleto || (doc.empleadoId ? `Empleado #${doc.empleadoId}` : "Sin Titular")}
                  </p>
                  {esDocumentoPublico ? (
                    <p className="text-xs text-foreground-muted">
                      Disponible para toda la organización
                    </p>
                  ) : doc.empleadoDni ? (
                    <p className="text-xs font-mono text-foreground-muted">
                      DNI: {doc.empleadoDni}
                    </p>
                  ) : null}
                </div>

                {/* Metadato: Usuario que subió */}
                <div className="space-y-1.5 rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    <UserCheck className="size-4 text-primary" />
                    Subido por
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {doc.subidoPorUsername ||
                      (doc.usuarioSubidaId ? `Usuario #${doc.usuarioSubidaId}` : "Sistema")}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-foreground-muted">
                    <Calendar className="size-3" />
                    {doc.fechaSubida ? formatFechaCompleta(doc.fechaSubida) : "—"}
                  </p>
                </div>
              </div>

              {/* Grid de Detalles Técnicos del Archivo */}
              <div className="space-y-3 rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  <Layers className="size-4 text-primary" />
                  Especificaciones del Archivo
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <span className="text-xs text-foreground-muted block">Tipo MIME:</span>
                    <span className="text-xs font-mono font-medium text-foreground">
                      {doc.contentType || "Desconocido"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-foreground-muted block">Tamaño:</span>
                    <span className="text-xs font-mono font-medium text-foreground">
                      {doc.tamanioLegible || (doc.tamanioBytes ? `${doc.tamanioBytes} bytes` : "—")}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-foreground-muted block">Visibilidad configurada:</span>
                    <span className="text-xs font-medium text-foreground">
                      {doc.visibilidad}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sección IA / RAG (Solo ROLE_ADMIN) */}
              {esAdmin && (
                <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      <Brain className="size-4 text-primary" />
                      Motor de Búsqueda IA & RAG
                    </div>
                    <div>
                      {estadoRagEfectivo === "INDEXADO" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          <Brain className="size-3" /> Activo en IA
                        </span>
                      )}
                      {estadoRagEfectivo === "INDEXANDO" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          <Loader2 className="size-3 animate-spin text-primary" />
                          Indexando…
                        </span>
                      )}
                      {estadoRagEfectivo === "SIN_INDEXAR" && (
                        <Badge variant="warning" className="text-xs">
                          Sin indexar
                        </Badge>
                      )}
                      {estadoRagEfectivo === "NO_APLICA" && (
                        <span className="text-xs text-foreground-muted">No aplica</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground-muted">
                    {estadoRagEfectivo === "INDEXADO" &&
                      "Este documento ha sido vectorizado e indexado en el motor RAG de LaborTrack para consultas semánticas en el asistente inteligente."}
                    {estadoRagEfectivo === "INDEXANDO" &&
                      "El documento se está vectorizando en segundo plano. Estará disponible en el asistente en breve."}
                    {estadoRagEfectivo === "SIN_INDEXAR" &&
                      "Este documento no forma parte de la base vectorial de IA. Puede indexarse manualmente con el botón a continuación."}
                    {estadoRagEfectivo === "NO_APLICA" &&
                      "Este tipo de documento no está configurado para procesarse con Inteligencia Artificial."}
                  </p>

                  {/* Botón Indexar para la IA (Solo ADMIN, activo y SIN_INDEXAR) */}
                  {!doc.fechaBaja && estadoRagEfectivo === "SIN_INDEXAR" && (
                    <div className="pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs text-primary hover:bg-primary-soft hover:text-primary"
                        onClick={() => setReindexarConfirmOpen(true)}
                        disabled={isReindexando}
                      >
                        <Sparkles className="size-3.5" />
                        Indexar para la IA
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-border bg-card px-6 py-4">
          <div>
            {puedeEliminar && onBaja && !doc?.fechaBaja ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-error hover:bg-error-soft hover:text-error"
                onClick={() => {
                  onOpenChange(false);
                  onBaja(doc);
                }}
              >
                <Trash2 className="mr-1.5 size-3.5" />
                Dar de baja documento
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
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* ── Diálogo de confirmación para Reindexar en Modal 360 ── */}
    <Dialog
      open={reindexarConfirmOpen}
      onOpenChange={(op) => {
        if (!op && !isReindexando) setReindexarConfirmOpen(false);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Indexar documento para IA</DialogTitle>
          <DialogDescription>
            ¿Confirmás que querés enviar el documento{" "}
            <strong className="text-foreground">
              {doc?.nombreDocumento}
            </strong>{" "}
            a procesar en el motor de Inteligencia Artificial (RAG)?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={() => setReindexarConfirmOpen(false)}
            disabled={isReindexando}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmarReindexar}
            disabled={isReindexando}
          >
            {isReindexando ? "Iniciando..." : "Confirmar indexación"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </>
);
}
