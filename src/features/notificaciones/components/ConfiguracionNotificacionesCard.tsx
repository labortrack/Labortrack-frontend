import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/shared/components";
import { Card, CardContent, CardHeader, Switch } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import {
  useConfiguracionNotificaciones,
  useModificarConfiguracionNotificacion,
} from "../hooks/useNotificaciones";
import type { ConfiguracionNotificacionDto } from "../types/notificaciones.types";
import { iconoPorTipo } from "../utils/notificacionPresentacion";

/** Agrupa por categoría respetando el orden en que llegan del backend. */
function agruparPorCategoria(items: ConfiguracionNotificacionDto[]) {
  const grupos = new Map<string, ConfiguracionNotificacionDto[]>();
  for (const item of items) {
    const grupo = grupos.get(item.categoriaNombre) ?? [];
    grupo.push(item);
    grupos.set(item.categoriaNombre, grupo);
  }
  return [...grupos.entries()];
}

export function ConfiguracionNotificacionesCard() {
  const configuracionQuery = useConfiguracionNotificaciones();
  const modificar = useModificarConfiguracionNotificacion();

  const cambiar = (item: ConfiguracionNotificacionDto, habilitada: boolean) =>
    modificar.mutate(
      { tipo: item.tipo, habilitada },
      {
        onSuccess: () =>
          toast.success(
            `${item.nombre}: ${habilitada ? "habilitada" : "deshabilitada"}.`,
          ),
        onError: (error) =>
          toast.error(
            normalizeApiError(error, "No se pudo actualizar la configuración.")
              .message,
          ),
      },
    );

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-bold text-foreground">
          Notificaciones automáticas
        </h2>
        <p className="mt-1 text-sm text-foreground-muted">
          Elegí qué eventos generan notificaciones. Deshabilitar un tipo deja de
          generar avisos nuevos; los ya enviados se conservan. Los avisos de
          seguridad de la cuenta y los avisos globales siempre se envían.
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
          agruparPorCategoria(configuracionQuery.data ?? []).map(
            ([categoria, items]) => (
              <section key={categoria} className="border-b border-border last:border-b-0">
                <h3 className="flex items-center justify-between bg-subtle px-5 py-2 text-xs font-bold uppercase tracking-[0.05em] text-foreground-muted">
                  {categoria}
                  <span className="font-semibold normal-case tracking-normal">
                    {items.filter((item) => item.habilitada).length} de{" "}
                    {items.length} activas
                  </span>
                </h3>
                <ul className="divide-y divide-border">
                  {items.map((item) => {
                    const Icon = iconoPorTipo[item.tipo];
                    const id = `config-notificacion-${item.tipo}`;
                    const pendiente =
                      modificar.isPending &&
                      modificar.variables?.tipo === item.tipo;
                    return (
                      <li
                        key={item.tipo}
                        className="flex items-center gap-4 px-5 py-4"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <label
                            htmlFor={id}
                            className="text-sm font-semibold text-foreground"
                          >
                            {item.nombre}
                          </label>
                          <p className="text-sm text-foreground-muted">
                            {item.descripcion}
                          </p>
                        </div>
                        <Switch
                          id={id}
                          checked={item.habilitada}
                          disabled={pendiente}
                          onCheckedChange={(habilitada) =>
                            cambiar(item, habilitada)
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
              </section>
            ),
          )
        )}
      </CardContent>
    </Card>
  );
}
