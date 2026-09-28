import { useParams, useSearchParams } from "react-router-dom";
import { BackLink, PageHeader, ErrorState, LoadingState } from "@/shared/components";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { useMiSolicitudAusenciaDetalle } from "../hooks/useSolicitudesAusencia";
import { SolicitudAusenciaDetalleContenido } from "../components/SolicitudAusenciaDetalleContenido";

export default function MiSolicitudAusenciaDetailPage() {
  const { solicitudId } = useParams();
  const [params] = useSearchParams();
  const rawId = Number(solicitudId);
  const id = Number.isSafeInteger(rawId) && rawId > 0 ? rawId : null;
  const query = useMiSolicitudAusenciaDetalle(id);
  return <div className="space-y-6">
    <div>
      <BackLink to={`/mis-ausencias${params.size ? `?${params}` : ""}`} />
      <PageHeader title="Detalle de solicitud de ausencia" description="Información registrada y seguimiento de la evaluación." />
    </div>
    {id === null ? <ErrorState message="La solicitud indicada no es válida." /> : query.isPending ? <LoadingState label="Cargando solicitud…" />
      : query.isError ? <ErrorState message={normalizeApiError(query.error).message} onRetry={() => void query.refetch()} />
      : query.data && <SolicitudAusenciaDetalleContenido solicitud={query.data} />}
  </div>;
}
