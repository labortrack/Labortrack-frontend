import { useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Upload, Paperclip, X, Tags, CalendarDays, MessageSquare } from "lucide-react";
import { FormField, ErrorState, LoadingState, EmptyState } from "@/shared/components";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Input, Textarea, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { useCrearSolicitudAusencia, useTiposAusenciaDisponibles } from "../hooks/useSolicitudesAusencia";
import { solicitudAusenciaSchema, validarAdjuntos, type SolicitudAusenciaForm } from "../schemas/solicitudAusenciaSchema";
import type { TipoAusenciaDisponible } from "../types/solicitudAusencia.types";
import { cantidadDiasAusencia, fechaLocalHoy } from "../utils/solicitudAusenciaFormatters";

export function SolicitarAusenciaDialog({ onClose }: { onClose: () => void }) {
  const tipos = useTiposAusenciaDisponibles();
  const [enviando, setEnviando] = useState(false);
  return <Dialog open onOpenChange={(open) => { if (!open && !enviando) onClose(); }}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader><DialogTitle>Solicitar ausencia</DialogTitle>
        <DialogDescription>Informá el período y el motivo. Recursos Humanos evaluará tu solicitud.</DialogDescription></DialogHeader>
      {tipos.isPending ? <LoadingState label="Cargando tipos disponibles…" /> : tipos.isError
        ? <ErrorState message={normalizeApiError(tipos.error).message} onRetry={() => void tipos.refetch()} />
        : !tipos.data?.length ? <EmptyState title="No hay tipos de solicitud activos disponibles." />
        : <SolicitudForm tipos={tipos.data} onClose={onClose} onPending={setEnviando} />}
    </DialogContent>
  </Dialog>;
}
function SolicitudForm({ tipos, onClose, onPending }: { tipos: TipoAusenciaDisponible[]; onClose: () => void; onPending: (value: boolean) => void }) {
  const mutation = useCrearSolicitudAusencia();
  const archivosRef = useRef<HTMLInputElement>(null);
  const [documentos, setDocumentos] = useState<File[]>([]);
  const [errorAdjuntos, setErrorAdjuntos] = useState<string>();
  const [errorEnvio, setErrorEnvio] = useState<string>();
  const form = useForm<SolicitudAusenciaForm>({ resolver: zodResolver(solicitudAusenciaSchema(tipos)),
    defaultValues: { tipoId: "", fechaDesde: "", fechaHasta: "", motivo: "" } });
  const [tipoId, fechaDesde, fechaHasta] = useWatch({ control: form.control, name: ["tipoId", "fechaDesde", "fechaHasta"] });
  const tipo = tipos.find((item) => String(item.id) === tipoId);
  const dias = cantidadDiasAusencia(fechaDesde, fechaHasta);
  const submit = form.handleSubmit(async (values) => {
    const error = validarAdjuntos(documentos) ?? (tipo?.requiereDocumento && !documentos.length ? "Adjuntá al menos un documento para este tipo de solicitud." : undefined);
    setErrorAdjuntos(error);
    setErrorEnvio(undefined);
    if (error) return;
    onPending(true);
    try {
      const respuesta = await mutation.mutateAsync({ datos: { tipoSolicitudAusenciaId: Number(values.tipoId), fechaDesde: values.fechaDesde, fechaHasta: values.fechaHasta, motivo: values.motivo }, documentos });
      toast.success("Solicitud registrada en revisión.", { description: respuesta.seDetectaronJornadas
        ? `Se asociaron ${respuesta.cantidadJornadasAsociadas} jornadas al período.`
        : "No se detectaron jornadas asociadas al rango seleccionado." });
      onClose();
    } catch (error) { setErrorEnvio(normalizeApiError(error, "No se pudo registrar la solicitud.").message); }
    finally { onPending(false); }
  });
  return <form onSubmit={submit} noValidate className="space-y-5">
    <fieldset disabled={mutation.isPending} className="space-y-5">
      <FormField icon={Tags} id="ausencia-tipo" label="Tipo de solicitud" required error={form.formState.errors.tipoId?.message}>
        <Controller name="tipoId" control={form.control} render={({ field }) => <Select value={field.value} onValueChange={field.onChange}>
          <SelectTrigger id="ausencia-tipo" aria-invalid={!!form.formState.errors.tipoId} aria-describedby={form.formState.errors.tipoId ? "ausencia-tipo-error" : undefined}><SelectValue placeholder="Seleccioná un tipo" /></SelectTrigger>
          <SelectContent>{tipos.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.nombre}</SelectItem>)}</SelectContent>
        </Select>} />
      </FormField>
      {tipo && <div className="rounded-lg border border-border bg-muted p-3 text-sm space-y-1">
        <p className="whitespace-pre-wrap break-words">{tipo.descripcion}</p>
        <p>Máximo: {tipo.maxDias} días · Retroactividad: {tipo.permiteRetroactiva ? "Permitida" : "No permitida"} · Documentación: {tipo.requiereDocumento ? "Obligatoria" : "Opcional"}</p>
      </div>}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField icon={CalendarDays} id="ausencia-desde" label="Fecha desde" required error={form.formState.errors.fechaDesde?.message}>
          <Input id="ausencia-desde" type="date" min={tipo && !tipo.permiteRetroactiva ? fechaLocalHoy() : undefined} {...form.register("fechaDesde")} aria-invalid={!!form.formState.errors.fechaDesde} aria-describedby={form.formState.errors.fechaDesde ? "ausencia-desde-error" : undefined} />
        </FormField>
        <FormField icon={CalendarDays} id="ausencia-hasta" label="Fecha hasta" required error={form.formState.errors.fechaHasta?.message}>
          <Input id="ausencia-hasta" type="date" {...form.register("fechaHasta")} aria-invalid={!!form.formState.errors.fechaHasta} aria-describedby={form.formState.errors.fechaHasta ? "ausencia-hasta-error" : undefined} />
        </FormField>
      </div>
      <p className="text-xs text-foreground-muted" role="status">{dias > 0 ? `${dias} días corridos, incluyendo ambas fechas.` : "Seleccioná un rango de fechas."} La solicitud puede registrarse aunque no existan jornadas asociadas.</p>
      <FormField icon={MessageSquare} id="ausencia-motivo" label="Motivo" required error={form.formState.errors.motivo?.message}>
        <Textarea id="ausencia-motivo" rows={3} {...form.register("motivo")} aria-invalid={!!form.formState.errors.motivo} aria-describedby={form.formState.errors.motivo ? "ausencia-motivo-error" : undefined} />
      </FormField>
      <FormField icon={Paperclip} id="ausencia-documentos" label="Documentación adjunta" required={tipo?.requiereDocumento}
        hint="PDF, JPG o PNG. Hasta 10 MB por archivo y 19 MB en total." error={errorAdjuntos}>
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 p-4">
          <Button id="ausencia-documentos" type="button" variant="outline" onClick={() => archivosRef.current?.click()} aria-invalid={!!errorAdjuntos} aria-describedby={errorAdjuntos ? "ausencia-documentos-error" : "ausencia-documentos-hint"}>
            <Upload aria-hidden="true" />Adjuntar documentos
          </Button>
          <span className="text-sm text-foreground-muted" role="status">{documentos.length ? `${documentos.length} documento${documentos.length === 1 ? "" : "s"} seleccionado${documentos.length === 1 ? "" : "s"}` : "No hay documentos seleccionados."}</span>
        </div>
        <input ref={archivosRef} className="hidden" aria-label="Seleccionar documentos adjuntos" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" aria-invalid={!!errorAdjuntos} aria-describedby={errorAdjuntos ? "ausencia-documentos-error" : "ausencia-documentos-hint"}
          onChange={(event) => {
            const siguientes = [...documentos, ...Array.from(event.target.files ?? [])];
            const error = validarAdjuntos(siguientes);
            setErrorAdjuntos(error);
            if (!error) setDocumentos(siguientes);
            event.target.value = "";
          }} />
      </FormField>
      {documentos.length > 0 && <ul className="space-y-2">{documentos.map((file, index) => <li key={index} className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm">
        <Paperclip className="size-4 shrink-0" /><span className="min-w-0 flex-1 break-words">{file.name} <span className="text-foreground-muted">({(file.size / 1024 / 1024).toFixed(2)} MB)</span></span>
        <Button type="button" variant="ghost" size="icon" aria-label={`Quitar ${file.name}`} onClick={() => { setDocumentos(documentos.filter((_, i) => i !== index)); setErrorAdjuntos(undefined); }}><X /></Button>
      </li>)}</ul>}
    </fieldset>
    {errorEnvio && <p role="alert" className="rounded-lg border border-error/30 bg-error-soft p-3 text-sm text-error">{errorEnvio}</p>}
    <DialogFooter><Button type="button" variant="outline" disabled={mutation.isPending} onClick={onClose}>Cancelar</Button>
      <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Enviando…" : "Confirmar solicitud"}</Button></DialogFooter>
  </form>;
}

