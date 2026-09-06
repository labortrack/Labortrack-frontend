import { useState } from "react";
import { Brain, Download, Eye, RotateCcw, Trash2 } from "lucide-react";
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
import { useListarDocumentos } from "../hooks/useDocumentacion";
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
  onDescargar: (doc: DocumentoRespuestaDto) => void;
  onBaja: (doc: DocumentoRespuestaDto) => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function DocumentosTable({
  filters,
  onPrevisualizar,
  onDescargar,
  onBaja,
}: DocumentosTableProps) {
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  // ── RBAC ───────────────────────────────────────────────────────────────────
  // El botón "Dar de baja" solo se renderiza para ADMIN y RRHH.
  // ROLE_OPERARIO puede ver y descargar, pero NO puede eliminar documentos.
  const user = useSessionStore((state) => state.user);
  const puedeEliminar =
    user?.rol === "ROLE_ADMIN" || user?.rol === "ROLE_RRHH";

  const query = useListarDocumentos(filters, page, PAGE_SIZE);

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
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (!query.data?.content.length) {
    return (
      <EmptyState
        title="Sin documentos"
        description="No se encontraron documentos con los filtros aplicados."
        action={
          <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
            <RotateCcw />
            Reintentar
          </Button>
        }
      />
    );
  }

  // ── Tabla ──────────────────────────────────────────────────────────────────
  return (
    <>
      {query.isFetching && !query.isPending ? (
        <p className="px-5 py-2 text-xs text-foreground-muted">Actualizando...</p>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre del documento</TableHead>
            <TableHead className="hidden md:table-cell">Tipo</TableHead>
            <TableHead className="hidden lg:table-cell">Fecha de subida</TableHead>
            <TableHead className="text-center">RAG</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {query.data.content.map((doc) => (
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

              {/* Tipo */}
              <TableCell className="hidden md:table-cell">
                <Badge variant="neutral">{doc.tipoDocumentoNombre}</Badge>
              </TableCell>

              {/* Fecha de subida */}
              <TableCell className="hidden lg:table-cell">
                <span className="text-sm text-foreground-muted">
                  {formatFecha(doc.fechaSubida)}
                </span>
              </TableCell>

              {/* Indicador RAG */}
              <TableCell className="text-center">
                {doc.esIndexadoRag ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        <Brain className="size-3" />
                        IA
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Indexado en el motor de búsqueda IA (RAG).
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="text-xs text-foreground-muted">—</span>
                )}
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

                  {/* ── Descargar (todos los roles) ── */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDescargar(doc);
                        }}
                        aria-label={`Descargar ${doc.nombreDocumento}`}
                      >
                        <Download />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Descargar</TooltipContent>
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
          ))}
        </TableBody>
      </Table>

      <Pagination
        page={query.data.number}
        totalPages={query.data.totalPages}
        totalElements={query.data.totalElements}
        disabled={query.isFetching}
        onPageChange={setPage}
      />
    </>
  );
}
