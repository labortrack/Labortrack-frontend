import { useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  AlertTriangle,
  Ban,
  MinusCircle,
  Plus,
  PlusCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  useAplicarConcepto,
  useAplicarDeduccion,
  useCancelarRecibo,
  useQuitarLinea,
  useRegenerarRecibo,
} from "../hooks/useRecibosSueldo";
import type {
  LineaRecibo,
  ReciboSueldoDetalleDto,
} from "../types/reciboSueldo.types";
import { useConceptosAdicionales } from "@/features/conceptoAdicional/hooks/useConceptosAdicionales";
import { useDeducciones } from "@/features/deduccion/hooks/useDeducciones";
import { formatValorParametro } from "@/features/recibos/utils/parametrosLiquidablesLabels";
import { ConfirmDialog, FormField } from "@/shared/components";
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

// ─── Agregar un concepto o una deducción del catálogo ───────────────────────

/**
 * Solo ofrece ítems activos y no generales: los generales ya se aplican a todos los recibos
 * del período. Los ya aplicados se reconocen por nombre (la línea guarda el nombre del ítem);
 * igual el backend rechaza un duplicado.
 */
export function AgregarItemCatalogo({
  recibo,
}: {
  recibo: ReciboSueldoDetalleDto;
}) {
  const conceptosQuery = useConceptosAdicionales("Activos");
  const deduccionesQuery = useDeducciones("Activas");
  const aplicarConcepto = useAplicarConcepto(recibo.id);
  const aplicarDeduccion = useAplicarDeduccion(recibo.id);
  const [submitError, setSubmitError] = useState<string>();

  const aplicados = new Set(recibo.lineas.map((linea) => linea.descripcion));
  const conceptos = (conceptosQuery.data ?? []).filter(
    (c) => !c.isGeneral && !aplicados.has(c.nombreConceptoAdicional),
  );
  const deducciones = (deduccionesQuery.data ?? []).filter(
    (d) => !d.isGeneral && !aplicados.has(d.nombreDeduccion),
  );

  const agregar = async (
    aplicar: (id: number) => Promise<unknown>,
    id: number,
    nombre: string,
  ) => {
    setSubmitError(undefined);
    try {
      await aplicar(id);
      toast.success(`"${nombre}" agregado al recibo.`);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, `No se pudo agregar "${nombre}".`).message,
      );
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-border p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
        Ajustar recibo
      </p>
      {submitError ? (
        <Alert variant="error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {submitError}
        </Alert>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        <SelectorItem
          id="recibo-agregar-concepto"
          icon={<PlusCircle className="size-4 shrink-0 text-primary" />}
          placeholder="Agregar concepto..."
          vacio="No hay conceptos particulares para agregar"
          opciones={conceptos.map((c) => ({
            id: c.id,
            nombre: c.nombreConceptoAdicional,
            valor: formatValorParametro(c.tipoConcepto, c.valorConcepto),
          }))}
          pending={aplicarConcepto.isPending}
          onAgregar={(id, nombre) =>
            agregar(aplicarConcepto.mutateAsync, id, nombre)
          }
        />
        <SelectorItem
          id="recibo-agregar-deduccion"
          icon={<MinusCircle className="size-4 shrink-0 text-error" />}
          placeholder="Agregar deducción..."
          vacio="No hay deducciones particulares para agregar"
          opciones={deducciones.map((d) => ({
            id: d.id,
            nombre: d.nombreDeduccion,
            valor: formatValorParametro(d.tipoConcepto, d.valorDeduccion),
          }))}
          pending={aplicarDeduccion.isPending}
          onAgregar={(id, nombre) =>
            agregar(aplicarDeduccion.mutateAsync, id, nombre)
          }
        />
      </div>
    </div>
  );
}

function SelectorItem({
  id,
  icon,
  placeholder,
  vacio,
  opciones,
  pending,
  onAgregar,
}: {
  id: string;
  icon: ReactNode;
  placeholder: string;
  vacio: string;
  opciones: { id: number; nombre: string; valor: string }[];
  pending: boolean;
  onAgregar: (id: number, nombre: string) => Promise<void>;
}) {
  const [elegido, setElegido] = useState("");
  const opcion = opciones.find((o) => String(o.id) === elegido);

  return (
    <div className="flex gap-2">
      <Select
        value={opcion ? elegido : ""}
        onValueChange={setElegido}
        disabled={opciones.length === 0 || pending}
      >
        <SelectTrigger id={id} aria-label={placeholder} className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-2">
            {icon}
            <SelectValue
              placeholder={opciones.length === 0 ? vacio : placeholder}
            />
          </span>
        </SelectTrigger>
        <SelectContent>
          {opciones.map((o) => (
            <SelectItem key={o.id} value={String(o.id)}>
              {o.nombre} · {o.valor}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={!opcion || pending}
        aria-label={opcion ? `Agregar ${opcion.nombre}` : "Agregar"}
        onClick={() => {
          if (!opcion) return;
          void onAgregar(opcion.id, opcion.nombre).then(() => setElegido(""));
        }}
      >
        {pending ? <Spinner /> : <Plus className="size-4" />}
      </Button>
    </div>
  );
}

// ─── Quitar una línea agregada a mano ───────────────────────────────────────

export function QuitarLineaButton({
  reciboId,
  linea,
}: {
  reciboId: number;
  linea: LineaRecibo;
}) {
  const quitar = useQuitarLinea(reciboId);

  if (!linea.quitable || linea.id == null) return null;
  const detalleId = linea.id;

  const handleQuitar = async () => {
    try {
      await quitar.mutateAsync(detalleId);
      toast.success(`"${linea.descripcion}" quitado del recibo.`);
    } catch (error) {
      toast.error(
        normalizeApiError(error, `No se pudo quitar "${linea.descripcion}".`)
          .message,
      );
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-foreground-muted hover:bg-error-soft hover:text-error"
          disabled={quitar.isPending}
          onClick={() => void handleQuitar()}
          aria-label={`Quitar ${linea.descripcion}`}
        >
          {quitar.isPending ? <Spinner /> : <Trash2 className="size-3.5" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Quitar del recibo</TooltipContent>
    </Tooltip>
  );
}

// ─── Regenerar y cancelar ───────────────────────────────────────────────────

export function AccionesBorrador({
  recibo,
}: {
  recibo: ReciboSueldoDetalleDto;
}) {
  const [regenerarOpen, setRegenerarOpen] = useState(false);
  const [cancelarOpen, setCancelarOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <Button
          variant="ghost"
          className="text-error hover:bg-error-soft hover:text-error"
          onClick={() => setCancelarOpen(true)}
        >
          <Ban className="mr-1.5 size-4" />
          Cancelar recibo
        </Button>
        <Button variant="outline" onClick={() => setRegenerarOpen(true)}>
          <RefreshCw className="mr-1.5 size-4" />
          Regenerar recibo
        </Button>
      </div>

      {regenerarOpen ? (
        <RegenerarReciboDialog
          recibo={recibo}
          onClose={() => setRegenerarOpen(false)}
        />
      ) : null}
      {cancelarOpen ? (
        <CancelarReciboDialog
          recibo={recibo}
          onClose={() => setCancelarOpen(false)}
        />
      ) : null}
    </>
  );
}

function RegenerarReciboDialog({
  recibo,
  onClose,
}: {
  recibo: ReciboSueldoDetalleDto;
  onClose: () => void;
}) {
  const mutation = useRegenerarRecibo(recibo.id);
  const [submitError, setSubmitError] = useState<string>();
  const ajustesManuales = recibo.lineas.filter((l) => l.quitable).length;

  const handleConfirm = async () => {
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync(undefined);
      toast.success("Recibo regenerado.", {
        description: "Se recalculó desde las asistencias del período.",
      });
      onClose();
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo regenerar el recibo.").message,
      );
    }
  };

  return (
    <ConfirmDialog
      open
      title="¿Regenerar este recibo?"
      description={`Se recalculará el recibo de ${recibo.apellidoNombre} desde las asistencias del período y los ítems generales vigentes. La información actual se sobrescribe.`}
      confirmLabel="Regenerar"
      destructive={ajustesManuales > 0}
      pending={mutation.isPending}
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) onClose();
      }}
      onConfirm={handleConfirm}
    >
      {ajustesManuales > 0 ? (
        <Alert variant="warning" className="mb-2">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          Se van a eliminar {ajustesManuales}{" "}
          {ajustesManuales === 1
            ? "ajuste cargado a mano"
            : "ajustes cargados a mano"}
          .
        </Alert>
      ) : null}
      {submitError ? (
        <Alert variant="error" className="mb-2">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {submitError}
        </Alert>
      ) : null}
    </ConfirmDialog>
  );
}

const cancelacionSchema = z.object({
  motivo: z
    .string()
    .trim()
    .min(1, "El motivo de la cancelación es obligatorio.")
    .max(500, "El motivo no puede superar los 500 caracteres."),
});

type CancelacionForm = z.infer<typeof cancelacionSchema>;

function CancelarReciboDialog({
  recibo,
  onClose,
}: {
  recibo: ReciboSueldoDetalleDto;
  onClose: () => void;
}) {
  const mutation = useCancelarRecibo(recibo.id);
  const [submitError, setSubmitError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CancelacionForm>({
    resolver: zodResolver(cancelacionSchema),
    defaultValues: { motivo: "" },
  });

  const cerrar = () => {
    if (!mutation.isPending) onClose();
  };

  const onSubmit = handleSubmit(async ({ motivo }) => {
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync(motivo.trim());
      toast.success("Recibo cancelado.", {
        description: `El recibo de ${recibo.apellidoNombre} no se emitirá con el lote.`,
      });
      onClose();
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo cancelar el recibo.").message,
      );
    }
  });

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) cerrar();
      }}
    >
      <DialogContent className="max-w-lg" aria-busy={mutation.isPending}>
        <DialogHeader>
          <DialogTitle>Cancelar recibo</DialogTitle>
          <DialogDescription>
            El recibo de {recibo.apellidoNombre} quedará cancelado y no se
            emitirá con el lote. La cancelación no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        {submitError ? (
          <Alert variant="error" className="mb-4">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {submitError}
          </Alert>
        ) : null}

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <FormField
            id="recibo-motivo-cancelacion"
            label="Motivo"
            error={errors.motivo?.message}
            required
          >
            <Textarea
              id="recibo-motivo-cancelacion"
              rows={3}
              maxLength={500}
              disabled={mutation.isPending}
              aria-invalid={Boolean(errors.motivo)}
              {...register("motivo")}
            />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={cerrar}
              disabled={mutation.isPending}
            >
              Volver
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Spinner className="text-white" />
                  Cancelando...
                </>
              ) : (
                <>
                  <Ban className="mr-1.5 size-4" />
                  Cancelar recibo
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
