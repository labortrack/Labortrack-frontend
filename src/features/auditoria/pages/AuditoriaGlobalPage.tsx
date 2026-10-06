import { useEffect, useMemo, useState } from "react";
import {
  FilterX,
  Layers,
  RotateCcw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/shared/components";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import {
  useEntidadesAuditables,
  useCambiosAuditoria,
  useHistorialAuditoriaDialog,
  formatNombreEntidad,
} from "@/features/auditoria";
import type {
  AuditoriaFeedItem,
  OperacionAuditoria,
} from "@/features/auditoria";

const ROLE_LABELS: Record<string, string> = {
  ROLE_ADMIN: "Administrador",
  ROLE_RRHH: "Recursos Humanos",
  ROLE_OPERARIO: "Operario",
};

function formatRol(rol?: string | null): string {
  if (!rol) return "Usuario";
  return ROLE_LABELS[rol] || rol.replace(/^ROLE_/, "");
}

function formatFechaHora(fechaIso: string): string {
  try {
    const date = new Date(fechaIso);
    if (isNaN(date.getTime())) return fechaIso;

    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  } catch {
    return fechaIso;
  }
}

function getOperacionBadge(operacion: OperacionAuditoria) {
  switch (operacion) {
    case "CREACION":
      return {
        label: "Creación",
        variant: "success" as const,
      };
    case "MODIFICACION":
      return {
        label: "Modificación",
        variant: "primary" as const,
      };
    case "ELIMINACION":
      return {
        label: "Eliminación",
        variant: "error" as const,
      };
    default:
      return {
        label: operacion,
        variant: "neutral" as const,
      };
  }
}

/**
 * Convierte una fecha 'YYYY-MM-DD' en el instante UTC del inicio del día según la zona horaria local.
 * Ej: '2026-10-02' -> new Date(2026, 9, 2, 0, 0, 0, 0).toISOString()
 */
function localDateStringToUtcStartOfDayIso(dateStr: string): string {
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr) - 1;
  const day = Number(dayStr);
  const localDate = new Date(year, month, day, 0, 0, 0, 0);
  return localDate.toISOString();
}

/**
 * Convierte una fecha 'YYYY-MM-DD' en el instante UTC del fin del día según la zona horaria local.
 * Ej: '2026-10-02' -> new Date(2026, 9, 2, 23, 59, 59, 999).toISOString()
 */
function localDateStringToUtcEndOfDayIso(dateStr: string): string {
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr) - 1;
  const day = Number(dayStr);
  const localDate = new Date(year, month, day, 23, 59, 59, 999);
  return localDate.toISOString();
}

export default function AuditoriaGlobalPage() {
  const {
    data: entidades,
    isLoading: loadingEntidades,
    isError: errorEntidades,
    error: errEntidadesObj,
    refetch: refetchEntidades,
  } = useEntidadesAuditables();

  // Dialog centralizado de auditoría
  const { abrirHistorial, renderDialog } = useHistorialAuditoriaDialog();

  // Entidad seleccionada (sin preselección)
  const [selectedEntidad, setSelectedEntidad] = useState<string>("");

  // Filtros del feed
  const [operacionFilter, setOperacionFilter] = useState<string>("TODAS");
  const [usuarioInput, setUsuarioInput] = useState<string>("");
  const [debouncedUsuario, setDebouncedUsuario] = useState<string>("");
  const [desdeInput, setDesdeInput] = useState<string>("");
  const [hastaInput, setHastaInput] = useState<string>("");

  // Debounce de ~400ms para el campo de texto usuario
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsuario(usuarioInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [usuarioInput]);

  // Manejo de cambio de entidad principal
  const handleEntidadChange = (nuevaEntidad: string) => {
    setSelectedEntidad(nuevaEntidad);
    // Cambiar la entidad limpia los filtros
    setOperacionFilter("TODAS");
    setUsuarioInput("");
    setDebouncedUsuario("");
    setDesdeInput("");
    setHastaInput("");
  };

  const handleLimpiarFiltros = () => {
    setOperacionFilter("TODAS");
    setUsuarioInput("");
    setDebouncedUsuario("");
    setDesdeInput("");
    setHastaInput("");
  };

  // Validación de rango de fechas
  const errorRangoFechas = useMemo(() => {
    if (desdeInput && hastaInput && desdeInput > hastaInput) {
      return "La fecha 'Desde' no puede ser posterior a la fecha 'Hasta'.";
    }
    return null;
  }, [desdeInput, hastaInput]);

  // Cálculo de filtros para query
  const queryFiltros = useMemo(() => {
    const filtros: {
      size?: number;
      usuario?: string;
      desde?: string;
      hasta?: string;
      operacion?: OperacionAuditoria;
    } = {
      size: 20,
    };

    if (operacionFilter !== "TODAS") {
      filtros.operacion = operacionFilter as OperacionAuditoria;
    }

    if (debouncedUsuario) {
      filtros.usuario = debouncedUsuario;
    }

    if (!errorRangoFechas) {
      if (desdeInput) {
        filtros.desde = localDateStringToUtcStartOfDayIso(desdeInput);
      }
      if (hastaInput) {
        filtros.hasta = localDateStringToUtcEndOfDayIso(hastaInput);
      }
    }

    return filtros;
  }, [operacionFilter, debouncedUsuario, desdeInput, hastaInput, errorRangoFechas]);

  // Hook infinito de cambios
  const isEnabledCambios = Boolean(selectedEntidad) && !errorRangoFechas;
  const {
    data: feedData,
    isLoading: loadingFeed,
    isError: errorFeed,
    error: errFeedObj,
    refetch: refetchFeed,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCambiosAuditoria(selectedEntidad, queryFiltros, {
    enabled: isEnabledCambios,
  });

  // Aplanar items paginados
  const itemsFeed = useMemo<AuditoriaFeedItem[]>(() => {
    if (!feedData?.pages) return [];
    return feedData.pages.flatMap((page) => page.items);
  }, [feedData]);

  const hayFiltrosActivos = Boolean(
    operacionFilter !== "TODAS" ||
      usuarioInput.trim() !== "" ||
      desdeInput !== "" ||
      hastaInput !== "",
  );

  // Parsear error del feed
  const feedErrorNormalizado = useMemo(() => {
    if (!errorFeed || !errFeedObj) return null;
    const normalized = normalizeApiError(errFeedObj);

    if (normalized.status === 403) {
      return {
        titulo: "Acceso no autorizado",
        mensaje: "No contás con los permisos necesarios para consultar las pistas de auditoría.",
      };
    }
    if (normalized.status === 404) {
      return {
        titulo: "Entidad no auditable",
        mensaje: "La entidad seleccionada no se encuentra habilitada para auditoría en el sistema.",
      };
    }
    if (normalized.status === 400) {
      return {
        titulo: "Parámetros de consulta inválidos",
        mensaje: normalized.message || "La solicitud no pudo procesarse debido a parámetros incorrectos.",
      };
    }
    return {
      titulo: "Error al cargar cambios",
      mensaje: normalized.message || "Ocurrió un error al obtener las revisiones del servidor.",
    };
  }, [errorFeed, errFeedObj]);

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <PageHeader
        title="Historial de Auditoría"
        description="Explorá los últimos cambios y revisiones registradas por entidad en el sistema."
      />

      {/* Si el endpoint de entidades falla, mostrar ErrorState */}
      {errorEntidades ? (
        <Card className="border-error/40 bg-card shadow-soft">
          <CardContent className="p-6">
            <ErrorState
              message={
                errEntidadesObj instanceof Error
                  ? errEntidadesObj.message
                  : "No se pudo obtener el listado de entidades auditables desde el backend."
              }
              onRetry={() => refetchEntidades()}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Tarjeta del Selector Principal de Entidad y Filtros */}
          <Card className="border-border bg-card shadow-soft">
            <CardHeader className="border-b border-border/60 pb-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Layers className="size-4 text-primary" />
                Explorador de Cambios por Entidad
              </h2>
              <p className="mt-1 text-xs text-foreground-muted">
                Seleccioná una entidad para consultar su feed de revisiones recientes sin requerir un ID específico.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {/* Selector de Entidad */}
              <div className="space-y-1.5 sm:max-w-md">
                <Label htmlFor="entidad-feed-select" className="text-xs font-semibold">
                  Entidad auditable
                </Label>
                <Select
                  value={selectedEntidad}
                  onValueChange={handleEntidadChange}
                  disabled={loadingEntidades}
                >
                  <SelectTrigger id="entidad-feed-select" className="w-full">
                    <SelectValue
                      placeholder={
                        loadingEntidades
                          ? "Cargando entidades..."
                          : "Seleccionar entidad..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(entidades ?? []).map((entidadClave) => (
                      <SelectItem key={entidadClave} value={entidadClave}>
                        {formatNombreEntidad(entidadClave)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtros: visibles solo cuando hay una entidad seleccionada */}
              {selectedEntidad && (
                <div className="rounded-lg border border-border/70 bg-subtle/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      Filtros de búsqueda
                    </span>
                    {hayFiltrosActivos && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleLimpiarFiltros}
                        className="h-7 text-xs text-foreground-muted hover:text-foreground gap-1.5"
                      >
                        <FilterX className="size-3.5" />
                        Limpiar filtros
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Filtro Operación */}
                    <div className="space-y-1.5">
                      <Label htmlFor="filtro-operacion" className="text-xs font-medium">
                        Operación
                      </Label>
                      <Select
                        value={operacionFilter}
                        onValueChange={setOperacionFilter}
                      >
                        <SelectTrigger id="filtro-operacion" className="w-full bg-card">
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TODAS">Todas</SelectItem>
                          <SelectItem value="CREACION">Creación</SelectItem>
                          <SelectItem value="MODIFICACION">Modificación</SelectItem>
                          <SelectItem value="ELIMINACION">Eliminación</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro Usuario */}
                    <div className="space-y-1.5">
                      <Label htmlFor="filtro-usuario" className="text-xs font-medium">
                        Usuario (email exacto)
                      </Label>
                      <Input
                        id="filtro-usuario"
                        type="text"
                        placeholder="ejemplo@empresa.com"
                        value={usuarioInput}
                        onChange={(e) => setUsuarioInput(e.target.value)}
                        className="w-full bg-card"
                      />
                    </div>

                    {/* Filtro Desde */}
                    <div className="space-y-1.5">
                      <Label htmlFor="filtro-desde" className="text-xs font-medium">
                        Desde
                      </Label>
                      <Input
                        id="filtro-desde"
                        type="date"
                        value={desdeInput}
                        onChange={(e) => setDesdeInput(e.target.value)}
                        className="w-full bg-card"
                      />
                    </div>

                    {/* Filtro Hasta */}
                    <div className="space-y-1.5">
                      <Label htmlFor="filtro-hasta" className="text-xs font-medium">
                        Hasta
                      </Label>
                      <Input
                        id="filtro-hasta"
                        type="date"
                        value={hastaInput}
                        onChange={(e) => setHastaInput(e.target.value)}
                        className="w-full bg-card"
                      />
                    </div>
                  </div>

                  {/* Aviso de validación de rango de fechas */}
                  {errorRangoFechas && (
                    <div className="flex items-center gap-2 rounded-md bg-error-soft/70 px-3 py-2 text-xs font-medium text-error-strong">
                      <ShieldAlert className="size-4 shrink-0 text-error" />
                      <span>{errorRangoFechas}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sección Principal de Contenido / Resultados */}
          {!selectedEntidad ? (
            /* Estado inicial: ninguna entidad elegida */
            <Card className="border-dashed border-border bg-card/50 p-12 text-center shadow-soft">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Sparkles className="size-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                Elegí una entidad para ver sus últimos cambios
              </h3>
              <p className="mt-1 text-sm text-foreground-muted">
                Seleccioná cualquiera de las entidades registradas para explorar su trazabilidad de cambios en tiempo real.
              </p>
            </Card>
          ) : errorRangoFechas ? (
            /* Si las fechas están invertidas, no consultamos y mostramos aviso */
            <Card className="border-border bg-card p-8 text-center shadow-soft">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-warning-soft text-warning">
                <ShieldAlert className="size-5" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">
                Rango de fechas inválido
              </h3>
              <p className="mt-1 text-xs text-foreground-muted">
                Ajustá las fechas de filtro para que "Desde" sea anterior o igual a "Hasta".
              </p>
            </Card>
          ) : loadingFeed ? (
            /* Estado de carga inicial */
            <Card className="border-border bg-card p-6 shadow-soft">
              <LoadingState label="Cargando últimos cambios de la entidad..." />
            </Card>
          ) : errorFeed ? (
            /* Estado de error inicial */
            <Card className="border-border bg-card p-6 shadow-soft">
              <ErrorState
                message={feedErrorNormalizado?.mensaje || "No se pudieron obtener las revisiones."}
                onRetry={() => refetchFeed()}
              />
            </Card>
          ) : itemsFeed.length === 0 ? (
            /* Estado sin resultados */
            <Card className="border-border bg-card p-6 shadow-soft">
              <EmptyState
                title={
                  hayFiltrosActivos
                    ? "No hay cambios que coincidan con los filtros"
                    : "No se registran cambios para esta entidad"
                }
                description={
                  hayFiltrosActivos
                    ? "Probá modificando o limpiando los filtros seleccionados para ampliar la búsqueda."
                    : "Esta entidad todavía no tiene eventos de auditoría almacenados."
                }
                action={
                  hayFiltrosActivos ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLimpiarFiltros}
                      className="gap-2"
                    >
                      <RotateCcw className="size-3.5" />
                      Limpiar filtros
                    </Button>
                  ) : undefined
                }
              />
            </Card>
          ) : (
            /* Lista de Resultados del Feed */
            <Card className="border-border bg-card shadow-soft overflow-hidden">
              <CardHeader className="border-b border-border/60 pb-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Últimos Cambios Registrados
                    </h3>
                    <p className="text-xs text-foreground-muted">
                      Hacé clic sobre cualquier fila para explorar el historial completo del registro.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-foreground-muted">
                    {itemsFeed.length} {itemsFeed.length === 1 ? "cambio cargado" : "cambios cargados"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Vista Tabla para Escritorio */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Fecha y Hora</TableHead>
                        <TableHead className="w-[140px]">Operación</TableHead>
                        <TableHead>Registro / Etiqueta</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead className="w-[140px]">Rol</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itemsFeed.map((item) => {
                        const op = getOperacionBadge(item.operacion);
                        return (
                          <TableRow
                            key={`${item.revision}-${item.entidad}-${item.entidadId}`}
                            tabIndex={0}
                            role="button"
                            onClick={() =>
                              abrirHistorial(
                                item.entidad,
                                item.entidadId,
                                item.etiqueta,
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                abrirHistorial(
                                  item.entidad,
                                  item.entidadId,
                                  item.etiqueta,
                                );
                              }
                            }}
                            className="cursor-pointer transition-colors hover:bg-subtle/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                          >
                            <TableCell className="font-mono text-xs text-foreground-muted">
                              {formatFechaHora(item.fecha)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={op.variant}>{op.label}</Badge>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                              {item.etiqueta}
                            </TableCell>
                            <TableCell className="text-xs text-foreground">
                              {item.usuario}
                            </TableCell>
                            <TableCell className="text-xs text-foreground-muted">
                              {formatRol(item.rol)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Vista Cards para Móvil */}
                <div className="divide-y divide-border md:hidden">
                  {itemsFeed.map((item) => {
                    const op = getOperacionBadge(item.operacion);
                    return (
                      <button
                        key={`${item.revision}-${item.entidad}-${item.entidadId}`}
                        type="button"
                        onClick={() =>
                          abrirHistorial(
                            item.entidad,
                            item.entidadId,
                            item.etiqueta,
                          )
                        }
                        className="w-full p-4 text-left transition-colors hover:bg-subtle/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-foreground">
                            {item.etiqueta}
                          </span>
                          <Badge variant={op.variant}>{op.label}</Badge>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground-muted">
                          <span>{formatFechaHora(item.fecha)}</span>
                          <span>•</span>
                          <span className="truncate max-w-[200px]">{item.usuario}</span>
                          <span>•</span>
                          <span>{formatRol(item.rol)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Botón Cargar Más y Estados de Paginación */}
                {hasNextPage && (
                  <div className="border-t border-border p-4 text-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="w-full sm:w-auto min-w-40 gap-2"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <Spinner className="size-4" />
                          Cargando más...
                        </>
                      ) : (
                        "Cargar más"
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Instancia única del Modal de Auditoría montado a nivel página */}
      {renderDialog()}
    </div>
  );
}
