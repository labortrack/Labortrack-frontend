import { useState } from "react";
import {
  Brain,
  Calendar,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileCode,
  FileSpreadsheet,
  FileText,
  Globe,
  HardDrive,
  Hash,
  Layers,
  Lock,
  ShieldCheck,
  Trash2,
  User,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import type { DocumentoRespuestaDto } from "../types/documentacion.types";

interface Documento360ModalProps {
  doc: DocumentoRespuestaDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDescargar?: (doc: DocumentoRespuestaDto) => void;
  onBaja?: (doc: DocumentoRespuestaDto) => void;
}

function formatFechaCompleta(iso: string) {
  try {
    const fecha = new Date(iso);
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
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

export function Documento360Modal({
  doc,
  open,
  onOpenChange,
  onDescargar,
  onBaja,
}: Documento360ModalProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);

  const user = useSessionStore((state) => state.user);
  const esAdmin = user?.rol === "ROLE_ADMIN";
  const puedeEliminar =
    user?.rol === "ROLE_ADMIN" || user?.rol === "ROLE_RRHH";

  if (!doc) return null;

  const handleCopyHash = async () => {
    if (!doc.hashSha256) return;
    try {
      await navigator.clipboard.writeText(doc.hashSha256);
      setCopiedHash(true);
      toast.success("Hash SHA-256 copiado al portapapeles");
      setTimeout(() => setCopiedHash(false), 2000);
    } catch {
      toast.error("No se pudo copiar el hash");
    }
  };

  const handleCopyPath = async () => {
    if (!doc.pathMinio) return;
    try {
      await navigator.clipboard.writeText(doc.pathMinio);
      setCopiedPath(true);
      toast.success("Ruta de almacenamiento copiada");
      setTimeout(() => setCopiedPath(false), 2000);
    } catch {
      toast.error("No se pudo copiar la ruta");
    }
  };

  const handleAbrirEnPestana = () => {
    if (doc.pathMinio) {
      window.open(doc.pathMinio, "_blank", "noopener,noreferrer");
    } else {
      toast.info("No hay URL directa disponible");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
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
                {esAdmin && (
                  doc.esIndexadoRag ? (
                    <Badge variant="primary">
                      <Brain className="mr-1 size-3" />
                      IA Indexado (RAG)
                    </Badge>
                  ) : (
                    <Badge variant="neutral" className="text-foreground-muted">
                      Sin RAG
                    </Badge>
                  )
                )}
                <Badge
                  variant="neutral"
                  className="flex items-center gap-1 text-xs"
                >
                  {doc.visibilidad?.toUpperCase() === "PUBLICA" ? (
                    <Globe className="size-3" />
                  ) : (
                    <Lock className="size-3" />
                  )}
                  {doc.visibilidad || "PRIVADA"}
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
              <HardDrive className="size-4 text-primary" />
              <span>Acciones sobre el archivo:</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={handleAbrirEnPestana}
              >
                <ExternalLink className="size-3.5" />
                Abrir / Ver archivo
              </Button>
              {onDescargar && (
                <Button
                  variant="primary"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => onDescargar(doc)}
                >
                  <Download className="size-3.5" />
                  Descargar
                </Button>
              )}
            </div>
          </div>

          {/* Grid de Secciones Básicas (Ficha Técnica y Asignación) */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Sección: Ficha Técnica del Archivo */}
            <div className="space-y-3 rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                <FileText className="size-4 text-primary" />
                Ficha Técnica
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-xs text-foreground-muted block">Tipo MIME / Formato:</span>
                  <span className="font-mono text-xs font-medium text-foreground">
                    {doc.contentType || "Desconocido"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-foreground-muted block">Fecha y Hora de Carga:</span>
                  <div className="flex items-center gap-1.5 text-xs text-foreground">
                    <Calendar className="size-3.5 text-foreground-muted" />
                    <span>{formatFechaCompleta(doc.fechaSubida)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-foreground-muted block">Usuario que realizó la carga:</span>
                  <div className="flex items-center gap-1.5 text-xs text-foreground">
                    <User className="size-3.5 text-foreground-muted" />
                    <span>Usuario #{doc.usuarioSubidaId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección: Vinculación & Legajo */}
            <div className="space-y-3 rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                <UserCheck className="size-4 text-primary" />
                Asignación / Legajo
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-xs text-foreground-muted block">Empleado / Legajo Vinculado:</span>
                  {doc.empleadoId ? (
                    <div className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
                      <UserCheck className="size-3.5" />
                      Legajo Empleado #{doc.empleadoId}
                    </div>
                  ) : (
                    <span className="text-xs text-foreground-muted italic">
                      Documento General Institucional (Sin legajo individual)
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-xs text-foreground-muted block">Tipo de Documento:</span>
                  <div className="flex items-center gap-1.5 text-xs text-foreground">
                    <Layers className="size-3.5 text-foreground-muted" />
                    <span className="font-medium">{doc.tipoDocumentoNombre}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-foreground-muted block">Visibilidad configurada:</span>
                  <span className="text-xs font-medium text-foreground">
                    {doc.visibilidad}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Secciones Avanzadas (ESTRICTAMENTE SOLO PARA ROLE_ADMIN) ── */}
          {esAdmin && (
            <>
              {/* Sección: Inteligencia Artificial (RAG) */}
              <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    <Brain className="size-4 text-primary" />
                    Motor de Búsqueda IA & RAG
                  </div>
                  {doc.esIndexadoRag ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      <Brain className="size-3" /> Activo en IA
                    </span>
                  ) : (
                    <span className="text-xs text-foreground-muted">Inactivo</span>
                  )}
                </div>
                <p className="text-xs leading-relaxed text-foreground-muted">
                  {doc.esIndexadoRag
                    ? "Este documento ha sido vectorizado e indexado en el motor RAG de LaborTrack. Su contenido puede ser consultado y referenciado de forma semántica por los modelos de IA del sistema."
                    : "Este documento no forma parte de la base de conocimiento vectorial del asistente de IA. Se encuentra almacenado para descarga y archivo administrativo."}
                </p>
              </div>

              {/* Sección: Seguridad & Trazabilidad Criptográfica */}
              <div className="space-y-3 rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  <ShieldCheck className="size-4 text-primary" />
                  Seguridad, Integridad y Storage
                </div>

                {/* Hash SHA-256 */}
                <div>
                  <div className="flex items-center justify-between text-xs text-foreground-muted">
                    <span className="flex items-center gap-1">
                      <Hash className="size-3" /> Hash SHA-256 de Integridad:
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyHash}
                      className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                    >
                      {copiedHash ? (
                        <>
                          <Check className="size-3 text-success" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" /> Copiar Hash
                        </>
                      )}
                    </button>
                  </div>
                  <div className="mt-1 rounded border border-border/80 bg-muted/60 p-2 font-mono text-[11px] break-all text-foreground">
                    {doc.hashSha256 || "No disponible"}
                  </div>
                </div>

                {/* Path MinIO */}
                <div>
                  <div className="flex items-center justify-between text-xs text-foreground-muted">
                    <span className="flex items-center gap-1">
                      <HardDrive className="size-3" /> Ruta en Almacenamiento MinIO:
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPath}
                      className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                    >
                      {copiedPath ? (
                        <>
                          <Check className="size-3 text-success" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" /> Copiar Ruta
                        </>
                      )}
                    </button>
                  </div>
                  <div className="mt-1 rounded border border-border/80 bg-muted/60 p-2 font-mono text-[11px] break-all text-foreground-muted">
                    {doc.pathMinio || "No disponible"}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-border bg-card px-6 py-4">
          <div>
            {puedeEliminar && onBaja ? (
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
            {onDescargar && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onDescargar(doc)}
              >
                <Download className="mr-1.5 size-3.5" />
                Descargar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
