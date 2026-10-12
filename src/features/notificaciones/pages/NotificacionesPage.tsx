import { useState } from "react";
import { CheckCheck } from "lucide-react";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Pagination,
} from "@/shared/components";
import { Button, Card, Tabs, TabsList, TabsTrigger } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { NotificacionItem } from "../components/NotificacionItem";
import { useAbrirNotificacion } from "../hooks/useAbrirNotificacion";
import {
  useCantidadNoLeidas,
  useMarcarTodasLeidas,
  useNotificaciones,
} from "../hooks/useNotificaciones";

const TAMANIO_PAGINA = 15;

export default function NotificacionesPage() {
  const [page, setPage] = useState(0);
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);
  const notificacionesQuery = useNotificaciones(page, TAMANIO_PAGINA, soloNoLeidas);
  const noLeidas = useCantidadNoLeidas().data ?? 0;
  const marcarTodas = useMarcarTodasLeidas();
  const abrir = useAbrirNotificacion();
  const pagina = notificacionesQuery.data;

  const cambiarFiltro = (valor: string) => {
    setSoloNoLeidas(valor === "no-leidas");
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificaciones"
        description="Avisos sobre tus solicitudes, documentación y novedades del sistema."
        actions={
          <Button
            variant="outline"
            disabled={noLeidas === 0 || marcarTodas.isPending}
            onClick={() => marcarTodas.mutate()}
          >
            <CheckCheck />
            Marcar todas como leídas
          </Button>
        }
      />

      <Tabs
        value={soloNoLeidas ? "no-leidas" : "todas"}
        onValueChange={cambiarFiltro}
      >
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="no-leidas">
            No leídas{noLeidas > 0 ? ` (${noLeidas})` : ""}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="overflow-hidden">
        {notificacionesQuery.isLoading ? (
          <LoadingState label="Cargando notificaciones..." />
        ) : notificacionesQuery.isError ? (
          <ErrorState
            message={normalizeApiError(notificacionesQuery.error).message}
            onRetry={() => notificacionesQuery.refetch()}
          />
        ) : !pagina || pagina.empty ? (
          <EmptyState
            title={soloNoLeidas ? "No tenés notificaciones sin leer" : "No tenés notificaciones"}
            description="Cuando haya novedades para vos, van a aparecer acá."
          />
        ) : (
          <>
            <div className="divide-y divide-border p-2">
              {pagina.content.map((notificacion) => (
                <NotificacionItem
                  key={notificacion.id}
                  notificacion={notificacion}
                  onSelect={abrir}
                />
              ))}
            </div>
            <Pagination
              page={pagina.number}
              totalPages={pagina.totalPages}
              totalElements={pagina.totalElements}
              disabled={notificacionesQuery.isFetching}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}
