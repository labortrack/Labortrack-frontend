import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, Plus, RotateCcw } from "lucide-react";
import { EmptyState, ErrorState, LoadingState, PageHeader, Pagination, SearchInput } from "@/shared/components";
import { Button, Card, CardContent, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { useTiposSolicitudAusencia } from "../hooks/useTiposSolicitudAusencia";
import { TipoSolicitudAusenciaBadge } from "../components/TipoSolicitudAusenciaDatos";
import { TipoSolicitudAusenciaFormDialog } from "../components/TipoSolicitudAusenciaDialogs";
import type { EstadoTipoSolicitudAusencia, TiposSolicitudAusenciaFiltros } from "../types/tipoSolicitudAusencia.types";

const booleanFiltro = (valor: string | null) => valor === "true" ? true : valor === "false" ? false : undefined;

export default function TiposSolicitudAusenciaPage() {
  const [params, setParams] = useSearchParams();
  const [crear, setCrear] = useState(false);
  const nombre = params.get("nombre") ?? "";
  const [nombreConsulta, setNombreConsulta] = useState(nombre);
  useEffect(() => {
    const timer = setTimeout(() => setNombreConsulta(nombre), 300);
    return () => clearTimeout(timer);
  }, [nombre]);
  const estadoParam = params.get("estado");
  const estado: EstadoTipoSolicitudAusencia | undefined = estadoParam === "ACTIVO" || estadoParam === "INACTIVO" ? estadoParam : undefined;
  const paginaParam = Number(params.get("page"));
  const page = Number.isSafeInteger(paginaParam) && paginaParam >= 0 ? paginaParam : 0;
  const filtros: TiposSolicitudAusenciaFiltros = {
    nombre: nombreConsulta.trim() || undefined,
    estado,
    permiteRetroactiva: booleanFiltro(params.get("permiteRetroactiva")),
    requiereDocumento: booleanFiltro(params.get("requiereDocumento")),
    page,
  };
  const query = useTiposSolicitudAusencia(filtros);
  const datos = query.data;
  const buscando = query.isFetching || nombreConsulta !== nombre;
  const hayFiltros = Boolean(nombre.trim() || estado || filtros.permiteRetroactiva !== undefined || filtros.requiereDocumento !== undefined);
  const cambiar = (clave: string, valor: string) => setParams((actuales) => {
    const siguientes = new URLSearchParams(actuales);
    if (valor && valor !== "todos") siguientes.set(clave, valor);
    else siguientes.delete(clave);
    if (clave !== "page") siguientes.delete("page");
    return siguientes;
  }, { replace: true });
  useEffect(() => {
    if (datos && !query.isPlaceholderData && !query.isFetching && nombreConsulta === nombre && page > 0 && page >= datos.totalPages) {
      setParams((actuales) => {
        const siguientes = new URLSearchParams(actuales);
        siguientes.set("page", String(Math.max(0, datos.totalPages - 1)));
        return siguientes;
      }, { replace: true });
    }
  }, [datos, page, nombreConsulta, nombre, query.isPlaceholderData, query.isFetching, setParams]);

  return <div className="space-y-6">
    <PageHeader title="Tipos de solicitud de ausencia" description="Administrá los tipos disponibles para registrar solicitudes de ausencia y sus reglas aplicables."
      actions={<Button className="w-full sm:w-auto" onClick={() => setCrear(true)}><Plus />Crear tipo de solicitud</Button>} />
    <Card><CardContent className="p-4 sm:p-5">
      <div className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(200px,1.4fr)_1fr_1fr_1fr_auto]">
        <div><Label htmlFor="tipos-ausencia-busqueda" className="mb-1.5 block">Búsqueda</Label>
          <SearchInput id="tipos-ausencia-busqueda" placeholder="Buscar por nombre" value={nombre} onChange={(event) => cambiar("nombre", event.target.value)} />
        </div>
        <FiltroSelect id="tipos-ausencia-estado" label="Estado" value={estado ?? "todos"} onChange={(valor) => cambiar("estado", valor)} opciones={[["ACTIVO", "Activo"], ["INACTIVO", "Inactivo"]]} />
        <FiltroSelect id="tipos-ausencia-retroactividad" label="Permite retroactividad" value={filtros.permiteRetroactiva === undefined ? "todos" : String(filtros.permiteRetroactiva)} onChange={(valor) => cambiar("permiteRetroactiva", valor)} opciones={[["true", "Sí"], ["false", "No"]]} />
        <FiltroSelect id="tipos-ausencia-documentacion" label="Requiere documentación" value={filtros.requiereDocumento === undefined ? "todos" : String(filtros.requiereDocumento)} onChange={(valor) => cambiar("requiereDocumento", valor)} opciones={[["true", "Sí"], ["false", "No"]]} />
        <Button variant="outline" onClick={() => setParams({}, { replace: true })}><RotateCcw />Limpiar filtros</Button>
      </div>
    </CardContent></Card>
    <Card className="overflow-hidden" aria-busy={buscando}>
      {query.isPending ? <LoadingState label="Cargando tipos de solicitud…" />
        : query.isError ? <ErrorState message={normalizeApiError(query.error, "No se pudieron obtener los tipos de solicitud.").message} onRetry={() => void query.refetch()} />
        : !datos?.content.length ? <EmptyState title={hayFiltros ? "No se encontraron tipos con los filtros seleccionados." : "No hay tipos de solicitud de ausencia registrados."}
          action={hayFiltros ? <Button variant="outline" onClick={() => setParams({}, { replace: true })}>Limpiar filtros</Button> : <Button variant="outline" onClick={() => setCrear(true)}><Plus />Crear tipo de solicitud</Button>} />
        : <>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted px-5 py-3 text-xs text-foreground-muted" role="status">
            <span>{datos.totalElements} tipo{datos.totalElements === 1 ? "" : "s"} de solicitud</span>
            {buscando && <span>Actualizando resultados…</span>}
          </div>
          <div className="overflow-x-auto"><Table>
            <TableHeader><TableRow>{["Nombre", "Descripción", "Máximo de días", "Retroactividad", "Documentación", "Estado", "Acción"].map((titulo) => <TableHead key={titulo}>{titulo}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{datos.content.map((tipo) => <TableRow key={tipo.id}>
              <TableCell className="max-w-64 whitespace-normal break-words font-semibold">{tipo.nombre}</TableCell>
              <TableCell className="max-w-80"><p className="line-clamp-2 whitespace-normal break-words text-foreground-muted" title={tipo.descripcion}>{tipo.descripcion}</p></TableCell>
              <TableCell>{tipo.maxDias}</TableCell><TableCell>{tipo.permiteRetroactiva ? "Sí" : "No"}</TableCell><TableCell>{tipo.requiereDocumento ? "Sí" : "No"}</TableCell>
              <TableCell><TipoSolicitudAusenciaBadge estado={tipo.estado} /></TableCell>
              <TableCell>{tipo.accionesDisponibles.includes("VER_DETALLE") && <Button variant="ghost" size="sm" asChild><Link to={`/ausencias/tipos-solicitud/${tipo.id}${params.size ? `?${params}` : ""}`} aria-label={`Ver detalle de ${tipo.nombre}`}>Ver detalle<ChevronRight /></Link></Button>}</TableCell>
            </TableRow>)}</TableBody>
          </Table></div>
          <Pagination page={page} totalPages={datos.totalPages} totalElements={datos.totalElements} disabled={buscando} onPageChange={(valor) => cambiar("page", String(valor))} />
        </>}
    </Card>
    {crear && <TipoSolicitudAusenciaFormDialog onClose={() => setCrear(false)} />}
  </div>;
}

function FiltroSelect({ id, label, value, onChange, opciones }: {
  id: string; label: string; value: string; onChange: (valor: string) => void; opciones: [string, string][];
}) {
  return <div><Label htmlFor={id} className="mb-1.5 block">{label}</Label>
    <Select value={value} onValueChange={onChange}><SelectTrigger id={id}><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="todos">Todos</SelectItem>{opciones.map(([valor, texto]) => <SelectItem key={valor} value={valor}>{texto}</SelectItem>)}</SelectContent>
    </Select>
  </div>;
}
