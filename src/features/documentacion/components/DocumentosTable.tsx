import { useState } from "react";
import { Eye, Loader2, RefreshCw, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Pagination,
} from "@/shared/components";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { cn } from "@/shared/utils/cn";
import {
  useHistorialAuditoriaDialog,
  HistorialAuditoriaIconButton,
} from "@/features/auditoria";
import { documentacionApi } from "../api/documentacionApi";
import { useListarDocumentos } from "../hooks/useDocumentacion";
import { useRagIndexingPolling } from "../hooks/useRagIndexingPolling";
import type { DocumentoFilterDto, DocumentoRespuestaDto } from "../types/documentacion.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFecha(iso: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DocumentosTableProps {
  filters: DocumentoFilterDto;
  onPrevisualizar: (doc: DocumentoRespuestaDto) => void;
  onBaja: (doc: DocumentoRespuestaDto) => void;
  onReactivar?: (doc: DocumentoRespuestaDto) => void;
  onReindexar?: (doc: DocumentoRespuestaDto) => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function DocumentosTable({
  filters,
  onPrevisualizar,
  onBaja,
  onReactivar,
  onReindexar,
}: DocumentosTableProps) {
  const { abrirHistorial, renderDialog } = useHistorialAuditoriaDialog();
  const [page, setPage] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const PAGE_SIZE = 10;

  // Si cambian los filtros (incluido el estado o búsqueda), reiniciamos la página a 0
  const [prevFilters, setPrevFilters] = useState(filters);
  if (prevFilters !== filters) {
    setPrevFilters(filters);
    setPage(0);
  }

  // ── RBAC ───────────────────────────────────────────────────────────────────
  // El backend exige ROLE_ADMIN para baja y reactivación de documentos.
  const user = useSessionStore((state) => state.user);
  const esAdmin = user?.rol === "ROLE_ADMIN";
  const puedeEliminar = esAdmin;
  const puedeReactivar = esAdmin;

  const [reindexarDoc, setReindexarDoc] = useState<DocumentoRespuestaDto | null>(null);
  const [isReindexando, setIsReindexando] = useState(false);
  const { iniciarPolling } = useRagIndexingPolling();

  const handleConfirmarReindexar = async () => {
    if (!reindexarDoc) return;
    setIsReindexando(true);
    try {
      await documentacionApi.reindexarDocumento(reindexarDoc.idDocumento);
      iniciarPolling(reindexarDoc);
      onReindexar?.(reindexarDoc);
      setReindexarDoc(null);
    } catch (error) {
      toast.error(
        normalizeApiError(error, "No se pudo iniciar la reindexación.").message,
      );
    } finally {
      setIsReindexando(false);
    }
  };

  const query = useListarDocumentos(filters, page, PAGE_SIZE);

  const handleActualizarEstado = async () => {
    setIsRefreshing(true);
    try {
      await query.refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // ── Estados ────────────────────────────────────────────────────────────────
  if (query.isPending) {
    return <LoadingState label="Cargando documentos..." />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message={
          normalizeApiError(
            query.error,
            "No se pudieron obtener los documentos.",
          ).message
        }
        onRetry={handleActualizarEstado}
      />
    );
  }

  if (!query.data?.content.length) {
    const emptyTitle =
      filters.nombreDocumento?.trim()
        ? "Sin coincidencias"
        : filters.estado === "INACTIVOS"
          ? "No hay documentos inactivos"
          : filters.estado === "TODOS"
            ? "Sin documentos registrados"
            : "No hay documentos activos";

    const emptyDescription =
      filters.nombreDocumento?.trim()
        ? `No se encontraron documentos que coincidan con "${filters.nombreDocumento}".`
        : filters.estado === "INACTIVOS"
          ? "No se encontraron documentos dados de baja en el sistema."
          : filters.estado === "TODOS"
            ? "Todavía no se ha subido ningún documento al sistema."
            : "No hay documentos activos para mostrar.";

    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleActualizarEstado}
            disabled={query.isFetching || isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={cn(
                "size-3.5",
                (query.isFetching || isRefreshing) && "animate-spin",
              )}
            />
            Actualizar Estado
          </Button>
        }
      />
    );
  }

  // ── Tabla ──────────────────────────────────────────────────────────────────
  const mostrarBadgeEstado =
    filters.estado === "INACTIVOS" || filters.estado === "TODOS";

  return (
    <>
      {/* ── Barra de Sincronización Manual ── */}
      <div className="flex items-center justify-between border-b border-border bg-muted/20 px-5 py-2.5">
        <span className="text-xs text-foreground-muted">
          {query.isFetching || isRefreshing ? (
            <span className="inline-flex items-center gap-1.5 text-primary">
              <Loader2 className="size-3.5 animate-spin" />
              Sincronizando estado con el servidor...
            </span>
          ) : (
            <span>
              {query.data.totalElements
                ? `${query.data.totalElements} documento(s) en total`
                : "Estado sincronizado"}
            </span>
          )}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleActualizarEstado}
          disabled={query.isFetching || isRefreshing}
          className="h-8 gap-1.5 text-xs font-medium"
        >
          <RefreshCw
            className={cn(
              "size-3.5",
              (query.isFetching || isRefreshing) && "animate-spin",
            )}
          />
          Actualizar Estado
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre del documento</TableHead>
            <TableHead className="hidden md:table-cell">Tipo</TableHead>
            <TableHead className="hidden lg:table-cell">Fecha de subida</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {query.data.content.map((doc) => {
            const isDadoDeBaja = Boolean(doc.fechaBaja);
            const estadoRagEfectivo =
              doc.estadoRag ?? (doc.esIndexadoRag ? "INDEXADO" : "SIN_INDEXAR");

            return (
              <TableRow
                key={doc.idDocumento}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-muted/60",
                  isDadoDeBaja && "opacity-60 bg-muted/20",
                )}
                onClick={() => onPrevisualizar(doc)}
              >
                {/* Nombre del documento */}
                <TableCell>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium leading-tight">{doc.nombreDocumento}</p>
                    {mostrarBadgeEstado && (
                      <Badge variant={isDadoDeBaja ? "neutral" : "success"}>
                        {isDadoDeBaja ? "Inactivo" : "Activo"}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-foreground-muted">
                    {doc.nombreArchivoOriginal}
                  </p>
                </TableCell>

                {/* Tipo con badge/chip según estado IA */}
                <TableCell className="hidden md:table-cell">
                  <div className="inline-flex items-center gap-1.5 flex-wrap">
                    <Badge variant="neutral">{doc.tipoDocumentoNombre}</Badge>
                    {estadoRagEfectivo === "INDEXADO" && (
                      <span
                        className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary border border-primary/20"
                        title="Documento procesado con Inteligencia Artificial (RAG)"
                      >
                        IA
                      </span>
                    )}
                    {estadoRagEfectivo === "INDEXANDO" && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary border border-primary/20"
                        title="Indexación en segundo plano en curso"
                      >
                        <Loader2 className="size-3 animate-spin text-primary" />
                        Indexando…
                      </span>
                    )}
                    {estadoRagEfectivo === "SIN_INDEXAR" && esAdmin && !isDadoDeBaja && (
                      <Badge
                        variant="warning"
                        className="text-[11px] py-0 px-2 font-medium"
                        title="Este documento no cuenta con vectores en la IA. Puede indexarse."
                      >
                        Sin indexar
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Fecha de subida */}
                <TableCell className="hidden lg:table-cell">
                  <span className="text-sm text-foreground-muted">
                    {formatFecha(doc.fechaSubida)}
                  </span>
                </TableCell>

              {/* Acciones */}
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end gap-1">
                  {/* ── Vista 360 / Detalle (todos los roles) ── */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPrevisualizar(doc);
                        }}
                        aria-label={`Ver detalle 360° de ${doc.nombreDocumento}`}
                      >
                        <Eye />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ver Vista 360°</TooltipContent>
                  </Tooltip>

                  {/* ── Indexar para la IA — SOLO ADMIN (documentos activos SIN_INDEXAR) ── */}
                  {!isDadoDeBaja && esAdmin && estadoRagEfectivo === "SIN_INDEXAR" ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-primary hover:bg-primary-soft hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReindexarDoc(doc);
                          }}
                          aria-label={`Indexar para la IA ${doc.nombreDocumento}`}
                        >
                          <Sparkles className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Indexar para la IA</TooltipContent>
                    </Tooltip>
                  ) : null}

                  {/* ── Reactivar — SOLO ADMIN (documentos inactivos) ── */}
                  {isDadoDeBaja && puedeReactivar && onReactivar ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-primary hover:bg-primary-soft hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReactivar(doc);
                          }}
                          aria-label={`Reactivar documento ${doc.nombreDocumento}`}
                        >
                          <RotateCcw className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Reactivar documento</TooltipContent>
                    </Tooltip>
                  ) : null}

                  {/* ── Dar de baja — SOLO ADMIN (documentos activos) ── */}
                  {!isDadoDeBaja && puedeEliminar ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 hover:bg-error-soft hover:text-error"
                          onClick={(e) => {
                            e.stopPropagation();
                            onBaja(doc);
                          }}
                          aria-label={`Dar de baja ${doc.nombreDocumento}`}
                        >
                          <Trash2 />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Dar de baja</TooltipContent>
                    </Tooltip>
                  ) : null}

                  {/* ── Ver Historial de Auditoría — SOLO ADMIN ── */}
                  <HistorialAuditoriaIconButton
                    onAbrir={() =>
                      abrirHistorial(
                        "documento",
                        doc.idDocumento,
                        doc.nombreDocumento,
                      )
                    }
                  />
                </div>
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Pagination
        page={query.data.number}
        totalPages={query.data.totalPages}
        totalElements={query.data.totalElements}
        disabled={query.isFetching}
        onPageChange={setPage}
      />

      {/* ── Diálogo de confirmación para Reindexar ── */}
      <Dialog
        open={Boolean(reindexarDoc)}
        onOpenChange={(open) => {
          if (!open && !isReindexando) setReindexarDoc(null);
        }}
      >
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Indexar documento para IA</DialogTitle>
            <DialogDescription>
              ¿Confirmás que querés enviar el documento{" "}
              <strong className="text-foreground">
                {reindexarDoc?.nombreDocumento}
              </strong>{" "}
              a procesar en el motor de Inteligencia Artificial (RAG)?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setReindexarDoc(null)}
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

      {renderDialog()}
    </>
  );
}
