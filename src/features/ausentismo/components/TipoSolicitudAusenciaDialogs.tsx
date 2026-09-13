import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Info, Power } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog, FormField } from "@/shared/components";
import { Alert, Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Spinner, Switch, Textarea } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { useDesactivarTipoSolicitudAusencia, useGuardarTipoSolicitudAusencia } from "../hooks/useTiposSolicitudAusencia";
import { tipoSolicitudAusenciaSchema, type TipoSolicitudAusenciaForm } from "../schemas/tipoSolicitudAusenciaSchema";
import type { TipoSolicitudAusenciaDetalle } from "../types/tipoSolicitudAusencia.types";

export function TipoSolicitudAusenciaFormDialog({ tipo, onClose }: {
  tipo?: TipoSolicitudAusenciaDetalle;
  onClose: () => void;
}) {
  const mutation = useGuardarTipoSolicitudAusencia(tipo?.id);
  const [submitError, setSubmitError] = useState<string>();
  const form = useForm<TipoSolicitudAusenciaForm>({
    resolver: zodResolver(tipoSolicitudAusenciaSchema),
    defaultValues: {
      nombre: tipo?.nombre ?? "",
      descripcion: tipo?.descripcion ?? "",
      maxDias: tipo ? String(tipo.maxDias) : "",
      permiteRetroactiva: tipo?.permiteRetroactiva ?? false,
      requiereDocumento: tipo?.requiereDocumento ?? false,
    },
  });
  const cerrar = () => { if (!mutation.isPending) onClose(); };
  const submit = form.handleSubmit(async (valores) => {
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync({ ...valores, maxDias: Number(valores.maxDias) });
      toast.success(tipo ? "El tipo de solicitud fue modificado correctamente." : "El tipo de solicitud fue creado correctamente.");
      onClose();
    } catch (error) {
      const normalized = normalizeApiError(error, tipo
        ? "No se pudo guardar el tipo de solicitud. Intentá nuevamente."
        : "No se pudo crear el tipo de solicitud. Intentá nuevamente.");
      if (normalized.status === 409) {
        form.setError("nombre", { message: normalized.message }, { shouldFocus: true });
      } else {
        setSubmitError(normalized.message);
      }
    }
  });
  return <Dialog open onOpenChange={(open) => { if (!open) cerrar(); }}>
    <DialogContent className="max-w-xl" aria-busy={mutation.isPending}>
      <DialogHeader>
        <DialogTitle>{tipo ? "Modificar tipo de solicitud" : "Crear tipo de solicitud"}</DialogTitle>
        <DialogDescription>Definí las reglas que se utilizarán para registrar solicitudes de ausencia.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} noValidate className="space-y-5">
        {tipo && <Alert><Info className="mt-0.5 size-4 shrink-0" /><p>Al modificar este tipo, se creará una nueva versión. Las solicitudes ya registradas conservarán las reglas vigentes al momento de su creación.</p></Alert>}
        {submitError && <Alert variant="error"><AlertCircle className="mt-0.5 size-4 shrink-0" />{submitError}</Alert>}
        <fieldset disabled={mutation.isPending} className="min-w-0 space-y-5">
          <FormField id="tipo-ausencia-nombre" label="Nombre" error={form.formState.errors.nombre?.message} required>
            <Input id="tipo-ausencia-nombre" autoComplete="off" aria-invalid={Boolean(form.formState.errors.nombre)} aria-describedby={form.formState.errors.nombre ? "tipo-ausencia-nombre-error" : undefined} {...form.register("nombre")} />
          </FormField>
          <FormField id="tipo-ausencia-descripcion" label="Descripción" error={form.formState.errors.descripcion?.message} required>
            <Textarea id="tipo-ausencia-descripcion" rows={3} aria-invalid={Boolean(form.formState.errors.descripcion)} aria-describedby={form.formState.errors.descripcion ? "tipo-ausencia-descripcion-error" : undefined} {...form.register("descripcion")} />
          </FormField>
          <FormField id="tipo-ausencia-maxDias" label="Máximo de días" error={form.formState.errors.maxDias?.message} required>
            <Input id="tipo-ausencia-maxDias" type="number" min={1} step={1} aria-invalid={Boolean(form.formState.errors.maxDias)} aria-describedby={form.formState.errors.maxDias ? "tipo-ausencia-maxDias-error" : undefined} {...form.register("maxDias")} />
          </FormField>
          <div className="grid gap-3 sm:grid-cols-2">
            <Controller name="permiteRetroactiva" control={form.control} render={({ field }) => <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-4">
              <Label htmlFor="tipo-ausencia-retroactiva">Permite retroactividad</Label>
              <Switch id="tipo-ausencia-retroactiva" checked={field.value} onCheckedChange={field.onChange} onBlur={field.onBlur} ref={field.ref} disabled={mutation.isPending} />
            </div>} />
            <Controller name="requiereDocumento" control={form.control} render={({ field }) => <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-4">
              <Label htmlFor="tipo-ausencia-documento">Requiere documentación</Label>
              <Switch id="tipo-ausencia-documento" checked={field.value} onCheckedChange={field.onChange} onBlur={field.onBlur} ref={field.ref} disabled={mutation.isPending} />
            </div>} />
          </div>
        </fieldset>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={cerrar} disabled={mutation.isPending}>Cancelar</Button>
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending && <Spinner />}{mutation.isPending ? "Guardando…" : tipo ? "Guardar cambios" : "Crear tipo"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}

export function DesactivarTipoSolicitudAusenciaDialog({ tipo, onClose }: {
  tipo: TipoSolicitudAusenciaDetalle;
  onClose: () => void;
}) {
  const mutation = useDesactivarTipoSolicitudAusencia(tipo.id);
  const [error, setError] = useState<string>();
  const confirmar = async () => {
    setError(undefined);
    try {
      await mutation.mutateAsync();
      toast.success("El tipo de solicitud fue desactivado correctamente.");
      onClose();
    } catch (err) {
      setError(normalizeApiError(err, "No se pudo desactivar el tipo de solicitud. Intentá nuevamente.").message);
    }
  };
  return <ConfirmDialog open title="Desactivar tipo de solicitud"
    description="Este tipo dejará de estar disponible para nuevas solicitudes. Las solicitudes históricas que lo hayan utilizado se conservarán sin cambios."
    confirmLabel="Desactivar tipo" destructive pending={mutation.isPending}
    onOpenChange={(open) => { if (!open && !mutation.isPending) onClose(); }}
    onConfirm={() => void confirmar()}>
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted p-4">
      <Power className="size-5 shrink-0 text-error" /><p className="break-words text-sm font-semibold">{tipo.nombre}</p>
    </div>
    {error && <Alert variant="error" className="mt-4">{error}</Alert>}
  </ConfirmDialog>;
}
