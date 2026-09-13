import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHeader, ErrorState, LoadingState } from "@/shared/components";
import { Button } from "@/shared/ui";
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
    <Button variant="ghost" size="sm" asChild><Link to={`/mis-ausencias${params.size ? `?${params}` : ""}`}><ArrowLeft />Volver a mis solicitudes</Link></Button>
    <PageHeader title="Detalle de solicitud de ausencia" description="Información registrada y seguimiento de la evaluación." />
    {id === null ? <ErrorState message="La solicitud indicada no es válida." /> : query.isPending ? <LoadingState label="Cargando solicitud…" />
      : query.isError ? <ErrorState message={normalizeApiError(query.error).message} onRetry={() => void query.refetch()} />
      : query.data && <SolicitudAusenciaDetalleContenido solicitud={query.data} />}
  </div>;
}
