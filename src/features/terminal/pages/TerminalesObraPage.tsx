import { useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Monitor, Pencil, Plus, Unplug } from "lucide-react";
import { toast } from "sonner";
import { terminalAdminApi, type Terminal, type CodigoTerminal } from "../api/terminalApi";
import { useQrClock } from "../hooks/useQrClock";
import { segundosRestantes } from "../utils/qrTime";
import { useObra } from "@/features/obra/hooks/useObras";
import { BackLink, ErrorState, LoadingState, PageHeader } from "@/shared/components";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { Alert, Button, Card, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Switch } from "@/shared/ui";

type Accion = { tipo: "codigo" | "desvincular"; terminal: Terminal };
export default function TerminalesObraPage() {
  const { id } = useParams();
  const obraId = Number(id);
  const valido = Number.isInteger(obraId) && obraId > 0;
  const client = useQueryClient();
  const key = ["terminales", obraId];
  const obra = useObra(valido ? obraId : null);
  const query = useQuery({ queryKey: key, queryFn: () => terminalAdminApi.listar(obraId), enabled: valido, refetchInterval: 5000 });
  const [edicion, setEdicion] = useState<Terminal | null | undefined>();
  const [nombre, setNombre] = useState("");
  const [habilitada, setHabilitada] = useState(true);
  const [accion, setAccion] = useState<Accion>();
  const [codigo, setCodigo] = useState<{ datos: CodigoTerminal; terminal: Terminal }>();
  const now = useQrClock();
  const errorToast = (error: unknown) => toast.error(normalizeApiError(error).message);
  const guardar = useMutation({
    mutationFn: () => edicion ? terminalAdminApi.editar(obraId, edicion.id, { nombre: nombre.trim(), habilitada }) : terminalAdminApi.crear(obraId, { nombre: nombre.trim(), habilitada }),
    onSuccess: async () => { setEdicion(undefined); await client.invalidateQueries({ queryKey: key }); toast.success("Terminal guardada"); },
    onError: errorToast,
  });
  const ejecutar = useMutation({
    mutationFn: async (item: Accion) => {
      if (item.tipo === "codigo") return terminalAdminApi.codigo(obraId, item.terminal.id);
      await terminalAdminApi.desvincular(obraId, item.terminal.id);
    },
    onSuccess: async (datos, item) => {
      setAccion(undefined);
      if (datos) setCodigo({ datos, terminal: item.terminal });
      else toast.success("Dispositivo desvinculado");
      await client.invalidateQueries({ queryKey: key });
    }, onError: errorToast,
  });
  const abrirEdicion = (terminal: Terminal | null) => {
    setNombre(terminal?.nombre ?? ""); setHabilitada(terminal?.habilitada ?? true); setEdicion(terminal);
  };
  const submit = (e: FormEvent) => { e.preventDefault(); guardar.mutate(); };
  const segundos = codigo ? segundosRestantes(codigo.datos.venceEn, now) : 0;
  const actual = query.data?.find(t => t.id === codigo?.terminal.id);
  const vinculada = Boolean(codigo && actual?.vinculada && actual.vinculadaEn !== codigo.terminal.vinculadaEn);
  if (!valido) return <ErrorState message="Obra no válida" />;
  return <div className="space-y-6">
    <BackLink to={`/obras/${obraId}`} />
    <PageHeader title="Terminales" description={obra.data?.nombreObra ?? "Pantallas de asistencia de la obra"} actions={<Button onClick={() => abrirEdicion(null)}><Plus /> Crear terminal</Button>} />
    <p className="text-foreground-muted">Creá una terminal para cada punto de acceso. Vinculá su navegador con un código temporal y administrá su acceso desde aquí.</p>
    {query.isPending ? <LoadingState /> : query.isError ? <ErrorState message={normalizeApiError(query.error).message} onRetry={() => void query.refetch()} /> :
      !query.data?.length ? <Card className="p-8 text-center"><Monitor className="mx-auto mb-3 size-10 text-primary" /><p>No hay terminales creadas para esta obra.</p></Card> :
        <div className="grid gap-4 lg:grid-cols-2">{query.data.map(terminal => <Card key={terminal.id} className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 text-lg font-semibold"><Monitor className="size-5 text-primary" />{terminal.nombre}</h2>
            <p className="mt-1 text-sm text-foreground-muted">{!terminal.habilitada ? "Deshabilitada" : terminal.vinculada ? "Vinculada" : "Sin dispositivo vinculado"}</p></div>
            <Button variant="outline" size="icon" aria-label={`Editar ${terminal.nombre}`} onClick={() => abrirEdicion(terminal)}><Pencil /></Button></div>
          {terminal.vinculadaEn && <p className="text-sm text-foreground-muted">Última vinculación: {new Date(terminal.vinculadaEn).toLocaleString("es-AR")}</p>}
          <div className="flex flex-wrap gap-2"><Button disabled={!terminal.habilitada || ejecutar.isPending} onClick={() => terminal.vinculada ? setAccion({ tipo: "codigo", terminal }) : ejecutar.mutate({ tipo: "codigo", terminal })}>{terminal.vinculada ? "Reemplazar dispositivo" : "Generar código"}</Button>
            {terminal.vinculada && <Button variant="outline" disabled={ejecutar.isPending} onClick={() => setAccion({ tipo: "desvincular", terminal })}><Unplug />Desvincular</Button>}</div>
        </Card>)}</div>}
    <Dialog open={edicion !== undefined} onOpenChange={open => { if (!open && !guardar.isPending) setEdicion(undefined); }}><DialogContent>
      <DialogHeader><DialogTitle>{edicion ? "Editar terminal" : "Crear terminal"}</DialogTitle><DialogDescription>La terminal pertenece a {obra.data?.nombreObra ?? "esta obra"}.</DialogDescription></DialogHeader>
      <form onSubmit={submit} className="space-y-5"><div className="space-y-2"><Label htmlFor="nombre-terminal">Nombre</Label><Input id="nombre-terminal" value={nombre} maxLength={100} onChange={e => setNombre(e.target.value)} placeholder="Entrada principal" required /></div>
        <div className="flex items-center justify-between gap-3"><Label htmlFor="terminal-habilitada">Habilitada</Label><Switch id="terminal-habilitada" checked={habilitada} onCheckedChange={setHabilitada} /></div>
        {!habilitada && <Alert variant="warning">Mientras esté deshabilitada, el dispositivo no podrá obtener códigos QR. Se cancelarán los códigos de vinculación pendientes.</Alert>}
        <DialogFooter><Button type="button" variant="outline" disabled={guardar.isPending} onClick={() => setEdicion(undefined)}>Cancelar</Button><Button type="submit" disabled={!nombre.trim() || guardar.isPending}>{guardar.isPending ? "Guardando…" : "Guardar"}</Button></DialogFooter>
      </form></DialogContent></Dialog>
    <Dialog open={Boolean(accion)} onOpenChange={open => { if (!open && !ejecutar.isPending) setAccion(undefined); }}><DialogContent>
      <DialogHeader><DialogTitle>{accion?.tipo === "codigo" ? "Reemplazar dispositivo" : "Desvincular dispositivo"}</DialogTitle><DialogDescription>{accion?.tipo === "codigo" ? "El dispositivo actual conservará acceso hasta que se ingrese el nuevo código. Al completar la vinculación, perderá acceso automáticamente." : "El dispositivo dejará de obtener nuevos QR. La terminal seguirá disponible para vincular otro dispositivo."}</DialogDescription></DialogHeader>
      <DialogFooter><Button variant="outline" disabled={ejecutar.isPending} onClick={() => setAccion(undefined)}>Cancelar</Button><Button disabled={ejecutar.isPending} onClick={() => accion && ejecutar.mutate(accion)}>Confirmar</Button></DialogFooter>
    </DialogContent></Dialog>
    <Dialog open={Boolean(codigo)} onOpenChange={open => { if (!open) setCodigo(undefined); }}><DialogContent>
      <DialogHeader><DialogTitle>Vincular {codigo?.terminal.nombre}</DialogTitle><DialogDescription>Abrí esta dirección en el navegador del dispositivo que mostrará el QR e ingresá el código.</DialogDescription></DialogHeader>
      <p className="break-all rounded-lg bg-subtle p-3 font-mono text-sm">{window.location.origin}/terminal</p>
      {vinculada ? <Alert variant="success">Dispositivo vinculado correctamente.</Alert> : segundos > 0 ? <div className="space-y-2 text-center"><p className="font-mono text-4xl font-bold tracking-widest">{codigo?.datos.codigo}</p><p className="text-sm text-foreground-muted">Vence en {Math.floor(segundos / 60)}:{String(segundos % 60).padStart(2, "0")}. Se puede usar una sola vez.</p></div> : <Alert variant="warning">El código venció. Generá uno nuevo para continuar.</Alert>}
      <DialogFooter><Button variant="outline" onClick={() => setCodigo(undefined)}>Cerrar</Button>{codigo && !vinculada && <Button disabled={ejecutar.isPending} onClick={() => ejecutar.mutate({ tipo: "codigo", terminal: actual ?? codigo.terminal })}>Generar otro código</Button>}</DialogFooter>
    </DialogContent></Dialog>
  </div>;
}
