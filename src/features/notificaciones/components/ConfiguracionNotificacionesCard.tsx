import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/shared/components";
import { Card, CardContent, CardHeader, Switch } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import {
  useConfiguracionNotificaciones,
  useModificarConfiguracionNotificacion,
} from "../hooks/useNotificaciones";
import { iconoPorTipo } from "../utils/notificacionPresentacion";

export function ConfiguracionNotificacionesCard() {
  const configuracionQuery = useConfiguracionNotificaciones();
  const modificar = useModificarConfiguracionNotificacion();

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-bold text-foreground">
          Notificaciones automáticas
        </h2>
        <p className="mt-1 text-sm text-foreground-muted">
          Elegí qué eventos generan notificaciones. Deshabilitar un tipo deja de
          generar avisos nuevos; los ya enviados se conservan.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {configuracionQuery.isLoading ? (
          <LoadingState label="Cargando configuración..." />
        ) : configuracionQuery.isError ? (
          <ErrorState
            message={normalizeApiError(configuracionQuery.error).message}
            onRetry={() => configuracionQuery.refetch()}
          />
        ) : (
          <ul className="divide-y divide-border">
            {configuracionQuery.data?.map((item) => {
              const Icon = iconoPorTipo[item.tipo];
              const id = `config-notificacion-${item.tipo}`;
              const pendiente =
                modificar.isPending && modificar.variables?.tipo === item.tipo;
              return (
                <li key={item.tipo} className="flex items-center gap-4 px-5 py-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <label htmlFor={id} className="text-sm font-semibold text-foreground">
                      {item.nombre}
                    </label>
                    <p className="text-sm text-foreground-muted">{item.descripcion}</p>
                  </div>
                  <Switch
                    id={id}
                    checked={item.habilitada}
                    disabled={pendiente}
                    onCheckedChange={(habilitada) =>
                      modificar.mutate(
                        { tipo: item.tipo, habilitada },
                        {
                          onSuccess: () =>
                            toast.success(
                              `${item.nombre}: ${habilitada ? "habilitada" : "deshabilitada"}.`,
                            ),
                          onError: (error) =>
                            toast.error(
                              normalizeApiError(
                                error,
                                "No se pudo actualizar la configuración.",
                              ).message,
                            ),
                        },
                      )
                    }
                  />
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
