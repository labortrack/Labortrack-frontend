import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, UserRound, X, Undo2 } from "lucide-react";
import { ErrorState, LoadingState, PageHeader } from "@/shared/components";
import { Button, Card, CardContent } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { useSolicitudAusenciaAdministrativaDetalle } from "../hooks/useSolicitudesAusenciaAdministrativas";
import { SolicitudAusenciaDetalleContenido } from "../components/SolicitudAusenciaDetalleContenido";
import { DecisionSolicitudAusenciaDialog } from "../components/DecisionSolicitudAusenciaDialog";
import type { AccionAdministrativaAusencia } from "../types/solicitudAusenciaAdministrativa.types";

export default function SolicitudAusenciaAdministrativaDetailPage() {
  const { solicitudId } = useParams();
  const [params] = useSearchParams();
  const valor = Number(solicitudId);
  const id = Number.isSafeInteger(valor) && valor > 0 ? valor : null;
  const query = useSolicitudAusenciaAdministrativaDetalle(id);
  const [accion, setAccion] = useState<AccionAdministrativaAusencia>();
  const solicitud = query.data;
  return <div className="space-y-6">
    <Button variant="ghost" size="sm" asChild><Link to={`/ausencias/solicitudes${params.size ? `?${params}` : ""}`}><ArrowLeft />Volver a solicitudes</Link></Button>
    <PageHeader title="Detalle de solicitud de ausencia" description="Revisá la información del empleado antes de registrar una decisión." />
    {id === null ? <ErrorState message="La solicitud indicada no es válida." /> : query.isPending ? <LoadingState label="Cargando solicitud…" />
      : query.isError ? <ErrorState message={normalizeApiError(query.error).message} onRetry={() => void query.refetch()} />
      : solicitud && <>
        <Card><CardContent className="flex items-center gap-3 p-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft"><UserRound className="size-5 text-primary" aria-hidden="true" /></span>
          <div className="min-w-0"><p className="text-xs text-foreground-muted">Empleado solicitante</p><p className="break-words font-semibold">{solicitud.empleado.nombre} {solicitud.empleado.apellido}</p></div>
        </CardContent></Card>
        <SolicitudAusenciaDetalleContenido solicitud={solicitud} />
        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          {solicitud.estado === "EN_REVISION" && solicitud.accionesDisponibles.includes("RECHAZAR") && <Button variant="destructive" onClick={() => setAccion("rechazar")}><X />Rechazar</Button>}
          {solicitud.estado === "EN_REVISION" && solicitud.accionesDisponibles.includes("ACEPTAR") && <Button onClick={() => setAccion("aceptar")}><Check />Aceptar</Button>}
          {solicitud.estado === "ACEPTADA" && solicitud.accionesDisponibles.includes("REVOCAR") && <Button variant="destructive" onClick={() => setAccion("revocar")}><Undo2 />Revocar</Button>}
        </div>
      </>}
    {accion && id !== null && <DecisionSolicitudAusenciaDialog id={id} accion={accion} onClose={() => setAccion(undefined)} />}
  </div>;
}

