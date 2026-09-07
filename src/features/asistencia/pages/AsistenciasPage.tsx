import { useDeferredValue, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, CalendarDays } from "lucide-react";
import { FiltrosParteDiario } from "../components/FiltrosParteDiario";
import { ListadoParteDiario } from "../components/ListadoParteDiario";
import { ResumenParteDiario } from "../components/ResumenParteDiario";
import {
  useCapacidadesAsistencia,
  useOpcionesFiltroAsistencia,
  useParteDiarioAsistencia,
} from "../hooks/useAsistencias";
import type { EstadoAsistencia } from "../types/asistencia.types";
import {
  type ParteDiarioFiltrosPersistidos,
  useParteDiarioFiltrosStore,
} from "../store/parteDiarioFiltrosStore";
import { formatFecha } from "../utils/asistenciaFormatters";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/shared/components";
import { Alert, Card, Spinner } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

function fechaLocalActual() {
  const ahora = new Date();
  const offset = ahora.getTimezoneOffset() * 60_000;
  return new Date(ahora.getTime() - offset).toISOString().slice(0, 10);
}

const ESTADOS_ASISTENCIA: EstadoAsistencia[] = [
  "PENDIENTE_INGRESO",
  "PRESENTE",
  "EGRESADO",
  "AUSENTE",
  "AUSENCIA_JUSTIFICADA",
  "NO_TRABAJADA_COMPUTABLE",
  "ANULADA",
];

function leerId(value: string | null) {
  if (!value) return undefined;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

function leerEstado(value: string | null) {
  return ESTADOS_ASISTENCIA.includes(value as EstadoAsistencia)
    ? (value as EstadoAsistencia)
    : undefined;
}

const CLAVES_FILTRO = [
  "fecha",
  "obraId",
  "cuadrillaId",
  "estado",
  "trabajador",
] as const;

function leerFiltrosDesdeUrl(
  searchParams: URLSearchParams,
): ParteDiarioFiltrosPersistidos {
  const fecha = searchParams.get("fecha") || undefined;
  const obraId = leerId(searchParams.get("obraId"));
  const cuadrillaId = leerId(searchParams.get("cuadrillaId"));
  const estado = leerEstado(searchParams.get("estado"));
  const trabajador = searchParams.get("trabajador") || undefined;

  return {
    ...(fecha ? { fecha } : {}),
    ...(obraId ? { obraId } : {}),
    ...(cuadrillaId ? { cuadrillaId } : {}),
    ...(estado ? { estado } : {}),
    ...(trabajador ? { trabajador } : {}),
  };
}

function crearParametrosFiltros(filtros: ParteDiarioFiltrosPersistidos) {
  const params = new URLSearchParams();
  if (filtros.fecha) params.set("fecha", filtros.fecha);
  if (filtros.obraId) params.set("obraId", String(filtros.obraId));
  if (filtros.cuadrillaId) {
    params.set("cuadrillaId", String(filtros.cuadrillaId));
  }
  if (filtros.estado) params.set("estado", filtros.estado);
  if (filtros.trabajador) params.set("trabajador", filtros.trabajador);
  return params;
}

export default function AsistenciasPage() {
  const hoy = useMemo(() => fechaLocalActual(), []);
  const usuarioId = useSessionStore((state) => state.user!.idUsuario);
  const [searchParams, setSearchParams] = useSearchParams();
  const filtrosGuardados = useParteDiarioFiltrosStore(
    (state) => state.filtrosPorUsuario[String(usuarioId)],
  );
  const guardarFiltros = useParteDiarioFiltrosStore(
    (state) => state.guardarFiltros,
  );
  const limpiarFiltros = useParteDiarioFiltrosStore(
    (state) => state.limpiarFiltros,
  );
  const urlFiltrosKey = searchParams.toString();
  const hayFiltrosEnUrl = CLAVES_FILTRO.some((clave) =>
    searchParams.has(clave),
  );
  const filtrosUrl = useMemo(
    () => leerFiltrosDesdeUrl(new URLSearchParams(urlFiltrosKey)),
    [urlFiltrosKey],
  );
  const filtrosSeleccionados = hayFiltrosEnUrl
    ? filtrosUrl
    : (filtrosGuardados ?? {});
  const fecha = filtrosSeleccionados.fecha || hoy;
  const obraId = filtrosSeleccionados.obraId;
  const cuadrillaId = filtrosSeleccionados.cuadrillaId;
  const estado = filtrosSeleccionados.estado;
  const trabajador = filtrosSeleccionados.trabajador ?? "";
  const trabajadorDiferido = useDeferredValue(trabajador.trim());
  const capacidadesQuery = useCapacidadesAsistencia();
  const opcionesQuery = useOpcionesFiltroAsistencia(fecha);
  const capacidadParteDiario = capacidadesQuery.data?.parteDiario;
  const puedeFiltrarObra = capacidadParteDiario?.alcance === "GLOBAL";
  const puedeFiltrarCuadrilla =
    capacidadParteDiario?.alcance === "GLOBAL" ||
    capacidadParteDiario?.alcance === "OBRA";
  const obraIdEfectiva = puedeFiltrarObra
    ? obraId
    : (capacidadParteDiario?.obraIdPredeterminada ?? undefined);
  const cuadrillaIdEfectiva = puedeFiltrarCuadrilla
    ? cuadrillaId
    : (capacidadParteDiario?.cuadrillaIdPredeterminada ?? undefined);
  const filtros = useMemo(
    () => ({
      fecha,
      ...(obraIdEfectiva ? { obraId: obraIdEfectiva } : {}),
      ...(cuadrillaIdEfectiva
        ? { cuadrillaId: cuadrillaIdEfectiva }
        : {}),
      ...(estado ? { estado } : {}),
      ...(trabajadorDiferido ? { trabajador: trabajadorDiferido } : {}),
    }),
    [
      cuadrillaIdEfectiva,
      estado,
      fecha,
      obraIdEfectiva,
      trabajadorDiferido,
    ],
  );
  const parteQuery = useParteDiarioAsistencia(filtros);
  const filtrosAplicados = Boolean(
    obraId || cuadrillaId || estado || trabajadorDiferido,
  );

  useEffect(() => {
    if (hayFiltrosEnUrl) {
      guardarFiltros(usuarioId, filtrosUrl);
    }
  }, [filtrosUrl, guardarFiltros, hayFiltrosEnUrl, usuarioId]);

  useEffect(() => {
    if (!hayFiltrosEnUrl && filtrosGuardados) {
      setSearchParams(crearParametrosFiltros(filtrosGuardados), {
        replace: true,
      });
    }
  }, [filtrosGuardados, hayFiltrosEnUrl, setSearchParams]);

  const aplicarFiltros = (nuevosFiltros: ParteDiarioFiltrosPersistidos) => {
    guardarFiltros(usuarioId, nuevosFiltros);
    setSearchParams(crearParametrosFiltros(nuevosFiltros), { replace: true });
  };

  const cambiarFecha = (nuevaFecha: string) => {
    if (!nuevaFecha) return;
    aplicarFiltros({
      ...filtrosSeleccionados,
      fecha: nuevaFecha === hoy ? undefined : nuevaFecha,
      obraId: undefined,
      cuadrillaId: undefined,
    });
  };

  const cambiarObra = (nuevaObraId?: number) => {
    aplicarFiltros({
      ...filtrosSeleccionados,
      obraId: nuevaObraId,
      cuadrillaId: undefined,
    });
  };

  const cambiarCuadrilla = (nuevaCuadrillaId?: number) => {
    aplicarFiltros({
      ...filtrosSeleccionados,
      cuadrillaId: nuevaCuadrillaId,
    });
  };

  const cambiarEstado = (nuevoEstado?: EstadoAsistencia) => {
    aplicarFiltros({ ...filtrosSeleccionados, estado: nuevoEstado });
  };

  const cambiarTrabajador = (nuevoTrabajador: string) => {
    aplicarFiltros({
      ...filtrosSeleccionados,
      trabajador: nuevoTrabajador || undefined,
    });
  };

  const limpiar = () => {
    limpiarFiltros(usuarioId);
    setSearchParams({}, { replace: true });
  };

  const filtrosBusqueda = crearParametrosFiltros(filtrosSeleccionados);
  const queryFiltros = filtrosBusqueda.size
    ? `?${filtrosBusqueda.toString()}`
    : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Asistencias"
          description="Consultá y controlá el parte diario según tu alcance operativo."
        />
        <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-primary/20 bg-primary-soft px-3 py-2 text-sm">
          <CalendarDays className="size-4 text-primary" />
          <span className="text-foreground-muted">Fecha seleccionada:</span>
          <strong className="text-primary">{formatFecha(fecha)}</strong>
        </div>
      </div>

      <FiltrosParteDiario
        fecha={fecha}
        obraId={obraIdEfectiva}
        cuadrillaId={cuadrillaIdEfectiva}
        estado={estado}
        trabajador={trabajador}
        opciones={opcionesQuery.data}
        opcionesCargando={opcionesQuery.isPending}
        puedeFiltrarObra={puedeFiltrarObra}
        puedeFiltrarCuadrilla={puedeFiltrarCuadrilla}
        onFechaChange={cambiarFecha}
        onObraChange={cambiarObra}
        onCuadrillaChange={cambiarCuadrilla}
        onEstadoChange={cambiarEstado}
        onTrabajadorChange={cambiarTrabajador}
        onLimpiar={limpiar}
      />

      {opcionesQuery.isError ? (
        <Alert variant="warning">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            No pudimos cargar las opciones de obra y cuadrilla para esta fecha.
            Podés continuar utilizando los demás filtros.
          </span>
        </Alert>
      ) : null}

      {parteQuery.isPending ? (
        <Card>
          <LoadingState label="Cargando el parte diario de asistencia…" />
        </Card>
      ) : parteQuery.isError ? (
        <Card>
          <ErrorState
            message={
              normalizeApiError(
                parteQuery.error,
                "No pudimos cargar el parte diario de asistencia.",
              ).message
            }
            onRetry={() => void parteQuery.refetch()}
          />
        </Card>
      ) : parteQuery.data ? (
        <div className="relative space-y-6" aria-busy={parteQuery.isFetching}>
          {parteQuery.isFetching ? (
            <span className="absolute right-0 top-0 z-10 flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs text-foreground-muted shadow-soft">
              <Spinner className="size-3.5 text-primary" />
              Actualizando
            </span>
          ) : null}

          <ResumenParteDiario resumen={parteQuery.data.resumen} />

          {parteQuery.data.asistencias.length > 0 ? (
            <ListadoParteDiario
              asistencias={parteQuery.data.asistencias}
              fechaLabel={formatFecha(parteQuery.data.fecha)}
              filtrosBusqueda={queryFiltros}
            />
          ) : (
            <Card>
              <EmptyState
                title={
                  filtrosAplicados
                    ? "No hay asistencias para estos filtros"
                    : "No hay asistencias disponibles para esta fecha"
                }
                description={
                  filtrosAplicados
                    ? "Probá quitando algún filtro para ampliar los resultados."
                    : "No se encontraron asistencias dentro de tu alcance operativo para la jornada seleccionada."
                }
              />
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
}
