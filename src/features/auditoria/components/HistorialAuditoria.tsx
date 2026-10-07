import { useMemo, useState } from "react";
import axios from "axios";
import {
  History,
  User,
  PlusCircle,
  FileEdit,
  Trash2,
  ArrowRight,
  ShieldAlert,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import {
  Badge,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/DataStates";
import { useHistorialAuditoria } from "../hooks/useAuditoria";
import {
  formatNombreCampo,
  formatValorAuditoria,
} from "../utils/campoDictionary";
import {
  CAMPOS_OCULTOS,
  formatNombreEntidad,
} from "../constants/entidades.constants";
import type {
  AuditoriaLogDTO,
  CambioCampoDTO,
  OperacionAuditoria,
} from "../types/auditoria.types";

export interface HistorialAuditoriaProps {
  /** Clave técnica de la entidad (ej: 'epp', 'obra', 'empleado') */
  entidad: string;
  /** Identificador único numérico del registro */
  id: number;
  /** Clases CSS adicionales para el contenedor */
  className?: string;
}

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

function getOperacionConfig(operacion: OperacionAuditoria) {
  switch (operacion) {
    case "CREACION":
      return {
        label: "Creación",
        badgeVariant: "success" as const,
        icon: PlusCircle,
        nodeBorder: "border-success text-success bg-success-soft",
      };
    case "MODIFICACION":
      return {
        label: "Modificación",
        badgeVariant: "primary" as const,
        icon: FileEdit,
        nodeBorder: "border-primary text-primary bg-primary-soft",
      };
    case "ELIMINACION":
      return {
        label: "Eliminación",
        badgeVariant: "error" as const,
        icon: Trash2,
        nodeBorder: "border-error text-error bg-error-soft",
      };
    default:
      return {
        label: operacion,
        badgeVariant: "neutral" as const,
        icon: History,
        nodeBorder: "border-border text-foreground-muted bg-muted",
      };
  }
}

/**
 * Renderiza el valor individual de un campo de cambio, manejando archivos con Tooltip.
 */
function ValorCampo({
  valor,
  campo,
}: {
  valor: string | null;
  campo: string;
}) {
  const isKeyField = campo.endsWith("Key") || campo.endsWith("_key");

  if (isKeyField && valor) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help items-center gap-1 font-medium text-foreground underline decoration-dotted underline-offset-2">
            <FileText className="size-3 text-foreground-muted" />
            Archivo modificado
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs break-all font-mono text-[11px]">
          {valor}
        </TooltipContent>
      </Tooltip>
    );
  }

  return <span>{formatValorAuditoria(valor)}</span>;
}

/**
 * Fila de cambio individual estilo "Git Diff".
 */
function CambioRow({ cambio }: { cambio: CambioCampoDTO }) {
  const nombreLegible = formatNombreCampo(cambio.campo);
  const esDistinto = cambio.campo.toLowerCase() !== nombreLegible.toLowerCase();

  // Detección de baja lógica / reactivación
  const esFechaBaja =
    cambio.campo === "fechaBaja" || cambio.campo === "fecha_baja";
  const esBajaLogica =
    esFechaBaja && cambio.valorAnterior === null && cambio.valorNuevo !== null;
  const esReactivacion =
    esFechaBaja && cambio.valorAnterior !== null && cambio.valorNuevo === null;

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border/70 bg-card p-3 transition-colors hover:border-border">
      {/* Encabezado del campo */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{nombreLegible}</span>
          {esDistinto && (
            <span className="font-mono text-[10px] text-foreground-muted">
              ({cambio.campo})
            </span>
          )}
        </div>

        {/* Badge especial para baja lógica o reactivación */}
        {esBajaLogica && (
          <Badge variant="error" className="text-[10px] font-bold uppercase tracking-wider">
            Baja
          </Badge>
        )}
        {esReactivacion && (
          <Badge variant="success" className="text-[10px] font-bold uppercase tracking-wider">
            Reactivación
          </Badge>
        )}
      </div>

      {/* Comparación Git Diff */}
      <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_auto_1fr]">
        {/* Valor Anterior */}
        <div className="flex items-center gap-2 overflow-hidden rounded-md border border-error-soft bg-error-soft/30 px-2.5 py-1.5 text-xs text-error-strong">
          <span className="flex size-4 shrink-0 items-center justify-center rounded-sm bg-error-soft font-mono text-[11px] font-bold text-error">
            -
          </span>
          <del className="truncate font-mono line-through decoration-error-strong/60">
            <ValorCampo valor={cambio.valorAnterior} campo={cambio.campo} />
          </del>
        </div>

        {/* Separador con flecha */}
        <div className="flex justify-center text-foreground-muted">
          <ArrowRight className="size-4 shrink-0 rotate-90 sm:rotate-0" />
        </div>

        {/* Valor Nuevo */}
        <div className="flex items-center gap-2 overflow-hidden rounded-md border border-success-soft bg-success-soft/30 px-2.5 py-1.5 text-xs text-success">
          <span className="flex size-4 shrink-0 items-center justify-center rounded-sm bg-success-soft font-mono text-[11px] font-bold text-success">
            +
          </span>
          <ins className="truncate font-mono font-medium no-underline">
            <ValorCampo valor={cambio.valorNuevo} campo={cambio.campo} />
          </ins>
        </div>
      </div>
    </div>
  );
}

/**
 * Nodo individual de la línea de tiempo.
 */
function NodoAuditoria({
  log,
  isLast,
}: {
  log: AuditoriaLogDTO;
  isLast: boolean;
}) {
  const config = getOperacionConfig(log.operacion);
  const Icono = config.icon;
  const fechaHora = formatFechaHora(log.fecha);

  // Filtrar campos técnicos no deseados
  const cambiosVisibles = useMemo(
    () =>
      (log.cambios ?? []).filter(
        (c) => !(CAMPOS_OCULTOS as readonly string[]).includes(c.campo),
      ),
    [log.cambios],
  );

  // En CREACION se inicia colapsado; en MODIFICACION y ELIMINACION expandido si tiene contenido
  const [expandido, setExpandido] = useState<boolean>(() => {
    if (log.operacion === "CREACION") return false;
    return true;
  });

  const tieneCambios = cambiosVisibles.length > 0;

  return (
    <div className="relative flex gap-4 pb-8 last:pb-2">
      {/* Línea vertical conectora del Timeline */}
      {!isLast && (
        <span
          className="absolute left-[17px] top-9 -bottom-1 w-[2px] bg-border"
          aria-hidden="true"
        />
      )}

      {/* Ícono de estado en el nodo */}
      <div
        className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 shadow-xs ${config.nodeBorder}`}
        title={`Revisión #${log.revision} - ${config.label}`}
      >
        <Icono className="size-4" />
      </div>

      {/* Tarjeta de contenido */}
      <div className="flex-1 overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all duration-200 hover:shadow-md">
        {/* Cabecera del nodo */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-subtle/50 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Badge variant={config.badgeVariant} className="font-semibold shadow-xs">
              {config.label}
            </Badge>

            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground-muted">
              Rev. #{log.revision}
            </span>

            <span className="text-xs text-foreground-muted">
              {fechaHora}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
              <span className="flex size-6 items-center justify-center rounded-full bg-muted text-foreground-muted">
                <User className="size-3.5" />
              </span>
              <span className="max-w-[160px] truncate font-medium text-foreground sm:max-w-[220px]" title={log.usuario}>
                {log.usuario}
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground-muted">
                {formatRol(log.rol)}
              </span>
            </div>

            {tieneCambios && (
              <button
                type="button"
                onClick={() => setExpandido((prev) => !prev)}
                className="ml-1 rounded-md p-1 text-foreground-muted hover:bg-muted hover:text-foreground focus:outline-none"
                aria-label={expandido ? "Contraer cambios" : "Expandir cambios"}
                title={expandido ? "Contraer cambios" : "Expandir cambios"}
              >
                {expandido ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Cuerpo del nodo */}
        <div className="p-4">
          {log.operacion === "CREACION" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-foreground">
                  Registro creado
                </p>
                {tieneCambios && (
                  <button
                    type="button"
                    onClick={() => setExpandido((prev) => !prev)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {expandido ? "Ocultar valores iniciales" : "Ver valores iniciales"}
                  </button>
                )}
              </div>
              {expandido && tieneCambios && (
                <div className="grid gap-2 pt-2">
                  {cambiosVisibles.map((cambio, idx) => (
                    <CambioRow
                      key={`${cambio.campo}-${idx}`}
                      cambio={cambio}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : log.operacion === "MODIFICACION" && !tieneCambios ? (
            <p className="text-xs italic text-foreground-muted">
              Sin detalle de cambios (registro anterior a la auditoría)
            </p>
          ) : tieneCambios ? (
            expandido ? (
              <div className="grid gap-2">
                {cambiosVisibles.map((cambio, idx) => (
                  <CambioRow
                    key={`${cambio.campo}-${idx}`}
                    cambio={cambio}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-foreground-muted">
                {cambiosVisibles.length} modificación(es) colapsada(s).
              </p>
            )
          ) : (
            <p className="text-xs text-foreground-muted">
              Operación registrada sin cambios adicionales.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Componente reutilizable e independiente: HistorialAuditoria.
 *
 * Puede ser utilizado dentro de páginas, modales o pestañas sin acoplamiento a su contenedor.
 */
export function HistorialAuditoria({
  entidad,
  id,
  className = "",
}: HistorialAuditoriaProps) {
  const { data: logs, isLoading, isError, error, refetch } = useHistorialAuditoria(
    entidad,
    id,
  );

  // Ordenar por revisión descendente (más nuevo primero) como defensa
  const logsOrdenados = useMemo(() => {
    if (!logs) return [];
    return [...logs].sort((a, b) => b.revision - a.revision);
  }, [logs]);

  // 1. Estado Cargando
  if (isLoading) {
    return <LoadingState label="Cargando historial de auditoría..." />;
  }

  // 2. Estado de Error
  if (isError) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;

    if (status === 403) {
      return (
        <div className="flex min-h-48 flex-col items-center justify-center p-8 text-center">
          <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-error-soft">
            <ShieldAlert className="size-5 text-error" />
          </span>
          <h3 className="font-semibold text-foreground">Acceso no autorizado</h3>
          <p className="mt-1 max-w-md text-sm text-foreground-muted">
            No tenés permisos para consultar la auditoría. Se requiere rol de Administrador.
          </p>
        </div>
      );
    }

    if (status === 404) {
      return (
        <div className="flex min-h-48 flex-col items-center justify-center p-8 text-center">
          <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-warning-soft">
            <AlertCircle className="size-5 text-warning" />
          </span>
          <h3 className="font-semibold text-foreground">Entidad no auditable</h3>
          <p className="mt-1 max-w-md text-sm text-foreground-muted">
            La entidad &quot;{formatNombreEntidad(entidad)}&quot; no existe o no tiene auditoría habilitada.
          </p>
        </div>
      );
    }

    return (
      <ErrorState
        message={
          error instanceof Error
            ? error.message
            : "No se pudo cargar el historial de auditoría."
        }
        onRetry={() => refetch()}
      />
    );
  }

  // 3. Estado Vacío (Sin modificaciones registradas)
  if (logsOrdenados.length === 0) {
    return (
      <EmptyState
        title="Sin modificaciones registradas"
        description={`No se encontraron eventos de auditoría para ${formatNombreEntidad(
          entidad,
        )} con ID #${id}.`}
      />
    );
  }

  // 4. Línea de Tiempo con el Historial
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <History className="size-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">
            Historial de Cambios ({logsOrdenados.length})
          </h3>
        </div>
        <span className="text-xs text-foreground-muted">
          {formatNombreEntidad(entidad)} #{id}
        </span>
      </div>

      <div className="flex flex-col">
        {logsOrdenados.map((log, index) => (
          <NodoAuditoria
            key={`${log.revision}-${log.fecha}-${index}`}
            log={log}
            isLast={index === logsOrdenados.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
