import { useState } from "react";
import {
  Brain,
  Edit2,
  FileText,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
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
import { useTiposDocumento } from "../hooks/useDocumentacion";
import type { TipoDocumentoDTO } from "../types/documentacion.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface TiposDocumentoTableProps {
  onEdit: (tipo: TipoDocumentoDTO) => void;
  onBaja: (tipo: TipoDocumentoDTO) => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function TiposDocumentoTable({ onEdit, onBaja }: TiposDocumentoTableProps) {
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const query = useTiposDocumento(page, PAGE_SIZE);

  // ── Estados de carga / error / vacío ───────────────────────────────────────
  if (query.isPending) {
    return <LoadingState label="Cargando tipos de documento..." />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message={
          normalizeApiError(
            query.error,
            "No se pudieron obtener los tipos de documento.",
          ).message
        }
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (!query.data?.content.length) {
    return (
      <EmptyState
        title="Sin tipos de documento"
        description="Todavía no hay tipos registrados. Creá el primero con el botón de arriba."
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
      {/* Indicador de revalidación en background */}
      {query.isFetching && !query.isPending ? (
        <p className="px-5 py-2 text-xs text-foreground-muted">Actualizando...</p>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden md:table-cell">Descripción</TableHead>
            <TableHead className="text-center">Procesar en RAG</TableHead>
            <TableHead className="hidden lg:table-cell">Categoría</TableHead>
            <TableHead className="hidden lg:table-cell">Visibilidad</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {query.data.content.map((tipo) => (
            <TableRow key={tipo.idTipoDocumento}>
              {/* Nombre */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileText className="size-4 shrink-0 text-foreground-muted" />
                  <span className="font-medium">{tipo.nombre}</span>
                </div>
              </TableCell>

              {/* Descripción */}
              <TableCell className="hidden max-w-[260px] truncate text-sm text-foreground-muted md:table-cell">
                {tipo.descripcion}
              </TableCell>

              {/* Procesar en RAG */}
              <TableCell className="text-center">
                {tipo.procesarEnRag ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        <Brain className="size-3" />
                        IA activa
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Los documentos de este tipo se indexan en el motor RAG.
                      Solo acepta PDF.
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="text-xs text-foreground-muted">—</span>
                )}
              </TableCell>

              {/* Categoría */}
              <TableCell className="hidden lg:table-cell">
                <Badge variant="outline">{tipo.categoriaRuteo}</Badge>
              </TableCell>

              {/* Visibilidad */}
              <TableCell className="hidden lg:table-cell">
                <span className="text-sm text-foreground-muted">
                  {tipo.visibilidadDefecto}
                </span>
              </TableCell>

              {/* Acciones */}
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => onEdit(tipo)}
                        aria-label={`Editar tipo ${tipo.nombre}`}
                      >
                        <Edit2 />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Editar</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 hover:bg-error-soft hover:text-error"
                        onClick={() => onBaja(tipo)}
                        aria-label={`Dar de baja tipo ${tipo.nombre}`}
                      >
                        <Trash2 />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Dar de baja</TooltipContent>
                  </Tooltip>
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
