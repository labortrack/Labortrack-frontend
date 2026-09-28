import { useState, useMemo } from "react";
import { Eye, Loader2, RefreshCw, Trash2 } from "lucide-react";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Pagination,
} from "@/shared/components";
import {
  Badge,
  Button,
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
import { useMiDocumentacion } from "../hooks/useDocumentacion";
import type { DocumentoRespuestaDto } from "../types/documentacion.types";

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

interface MiDocumentacionTableProps {
  searchTerm?: string;
  onPrevisualizar: (doc: DocumentoRespuestaDto) => void;
  onBaja: (doc: DocumentoRespuestaDto) => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function MiDocumentacionTable({
  searchTerm = "",
  onPrevisualizar,
  onBaja,
}: MiDocumentacionTableProps) {
  const [page, setPage] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const PAGE_SIZE = 10;

  // ── RBAC ───────────────────────────────────────────────────────────────────
  const user = useSessionStore((state) => state.user);
  const puedeEliminar =
    user?.rol === "ROLE_ADMIN" || user?.rol === "ROLE_RRHH";

  const query = useMiDocumentacion();

  const handleActualizarEstado = async () => {
    setIsRefreshing(true);
    try {
      await query.refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filtrado local por término de búsqueda (en memoria)
  const filteredDocs = useMemo(() => {
    const list = query.data ?? [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (doc) =>
        doc.nombreDocumento?.toLowerCase().includes(term) ||
        doc.nombreArchivoOriginal?.toLowerCase().includes(term) ||
        doc.tipoDocumentoNombre?.toLowerCase().includes(term),
    );
  }, [query.data, searchTerm]);

  // Paginación local en memoria si hay más de PAGE_SIZE elementos
  const totalElements = filteredDocs.length;
  const totalPages = Math.ceil(totalElements / PAGE_SIZE) || 1;
  const paginatedDocs = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredDocs.slice(start, start + PAGE_SIZE);
  }, [filteredDocs, page, PAGE_SIZE]);

  // ── Estados ────────────────────────────────────────────────────────────────
  if (query.isPending) {
    return <LoadingState label="Cargando mis documentos..." />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message={
          normalizeApiError(
            query.error,
            "No se pudieron obtener tus documentos.",
          ).message
        }
        onRetry={handleActualizarEstado}
      />
    );
  }

  if (!filteredDocs.length) {
    return (
      <EmptyState
        title="Sin documentos"
        description={
          searchTerm.trim()
            ? "No se encontraron documentos con el criterio de búsqueda."
            : "No tenés documentos personales registrados actualmente."
        }
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
              {filteredDocs.length
                ? `${filteredDocs.length} documento(s) personal(es)`
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
          {paginatedDocs.map((doc) => {
            const esProcesableIa =
              doc.esIndexadoRag ||
              (doc.indexadoEnRag && doc.indexadoEnRag !== "NO_APLICA");

            return (
              <TableRow
                key={doc.idDocumento}
                className="cursor-pointer transition-colors hover:bg-muted/60"
                onClick={() => onPrevisualizar(doc)}
              >
                {/* Nombre del documento */}
                <TableCell>
                  <p className="font-medium leading-tight">{doc.nombreDocumento}</p>
                  <p className="text-xs text-foreground-muted">
                    {doc.nombreArchivoOriginal}
                  </p>
                </TableCell>

                {/* Tipo con badge sutil para documentos indexables con IA */}
                <TableCell className="hidden md:table-cell">
                  <div className="inline-flex items-center gap-1.5 flex-wrap">
                    <Badge variant="neutral">{doc.tipoDocumentoNombre}</Badge>
                    {esProcesableIa ? (
                      <span
                        className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary border border-primary/20"
                        title="Documento procesable con Inteligencia Artificial (RAG)"
                      >
                        IA
                      </span>
                    ) : null}
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

                  {/* ── Dar de baja — SOLO ADMIN / RRHH ── */}
                  {puedeEliminar ? (
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
                </div>
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          disabled={query.isFetching}
          onPageChange={setPage}
        />
      )}
    </>
  );
}
