import { useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Calendar,
  ClipboardCheck,
  Plus,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import {
  nuevoRemitoSchema,
  type NuevoRemitoForm,
} from "../../schemas/epp.schemas";
import { useEpps, useRegistrarRemito } from "../../hooks/useEpp";
import type { Remito } from "../../types/epp.types";
import {
  MAX_ITEMS_REMITO,
  eppIdsElegidosEnOtrasFilas,
  formatNumeroRemito,
  resumenItems,
} from "../../utils/remito";
import { EppEmpleadoCombobox } from "./EppEmpleadoCombobox";
import { ImprimirRemitoButton } from "../ImprimirRemitoButton";
import { FormField } from "@/shared/components";
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Spinner,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { fechaLocalActual } from "@/shared/utils/fechaLocal";

interface EppDeliveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEppId?: number;
}

function valoresIniciales(eppId: number, fechaEntrega: string): NuevoRemitoForm {
  return {
    empleadoId: 0,
    fechaEntrega,
    items: [{ eppId, cantidad: 1 }],
  };
}

export function EppDeliveryModal({
  open,
  onOpenChange,
  initialEppId,
}: EppDeliveryModalProps) {
  const [submitError, setSubmitError] = useState<string>();
  // Remito recién registrado: muestra la vista de éxito con la opción de imprimirlo.
  const [remitoRegistrado, setRemitoRegistrado] = useState<Remito>();
  const registrarMutation = useRegistrarRemito();
  const isPending = registrarMutation.isPending;

  // Catálogos
  const { data: epps = [], isLoading: isLoadingEpps } = useEpps();
  const activeEpps = epps.filter((epp) => epp.activo);

  const todayStr = fechaLocalActual();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<NuevoRemitoForm>({
    resolver: zodResolver(nuevoRemitoSchema),
    values: initialEppId ? valoresIniciales(initialEppId, todayStr) : undefined,
    defaultValues: valoresIniciales(initialEppId ?? 0, todayStr),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = useWatch({ control, name: "items" }) ?? [];

  // No se agregan filas por encima del máximo del backend ni más que EPP activos para elegir.
  const puedeAgregarItem =
    fields.length < MAX_ITEMS_REMITO && fields.length < activeEpps.length;
  const errorItems = errors.items?.message ?? errors.items?.root?.message;

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset(valoresIniciales(initialEppId ?? 0, todayStr));
      setSubmitError(undefined);
      setRemitoRegistrado(undefined);
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(undefined);

    try {
      setRemitoRegistrado(await registrarMutation.mutateAsync(values));
    } catch (err) {
      const normalized = normalizeApiError(
        err,
        "No se pudo registrar la entrega del EPP.",
      );
      setSubmitError(normalized.message);
    }
  });

  if (remitoRegistrado) {
    const operario = `${remitoRegistrado.apellidoEmpleado}, ${remitoRegistrado.nombreEmpleado}`;
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="size-5 text-success" />
              Remito N° {formatNumeroRemito(remitoRegistrado.id)} registrado
            </DialogTitle>
            <DialogDescription>
              Se entregó a {operario}: {resumenItems(remitoRegistrado.items)}.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Cerrar
            </Button>
            <ImprimirRemitoButton remitoId={remitoRegistrado.id} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="size-5 text-primary" />
            Registrar Entrega de EPP
          </DialogTitle>
          <DialogDescription>
            Asigná uno o más equipos de protección personal a un operario o empleado activo.
            Se emite un único remito con todos los ítems.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {submitError ? (
            <Alert variant="error" className="flex items-start gap-2 text-sm">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </Alert>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_11rem]">
            {/* Selector de Empleado con Combobox Popover */}
            <FormField
              id="empleadoId"
              label="Empleado Destinatario"
              icon={User}
              required
              error={errors.empleadoId?.message}
            >
              <Controller
                control={control}
                name="empleadoId"
                render={({ field }) => (
                  <EppEmpleadoCombobox
                    id="empleadoId"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    error={errors.empleadoId?.message}
                  />
                )}
              />
            </FormField>

            {/* Fecha de Entrega */}
            <FormField
              id="fechaEntrega"
              label="Fecha de Entrega"
              icon={Calendar}
              required
              error={errors.fechaEntrega?.message}
            >
              <Input
                id="fechaEntrega"
                type="date"
                max={todayStr}
                disabled={isPending}
                aria-invalid={Boolean(errors.fechaEntrega)}
                {...register("fechaEntrega")}
              />
            </FormField>
          </div>

          {/* Ítems del remito: un EPP por fila, sin repetir */}
          <fieldset className="space-y-2">
            <legend className="flex items-center gap-2 text-xs font-bold uppercase leading-4 tracking-[0.06em] text-foreground-muted">
              <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
              Elementos a entregar *
            </legend>

            {isLoadingEpps ? (
              <p className="text-xs text-foreground-muted">Cargando catálogo de EPP...</p>
            ) : activeEpps.length === 0 ? (
              <p className="text-xs text-foreground-muted">
                No hay EPPs activos disponibles para entrega.
              </p>
            ) : null}

            <div className="max-h-[45vh] space-y-3 overflow-y-auto pr-1">
              {fields.map((field, index) => {
                const numeroFila = index + 1;
                const eppId = Number(items[index]?.eppId);
                const cantidad = Number(items[index]?.cantidad);
                const epp = activeEpps.find((item) => item.id === eppId);
                const elegidos = eppIdsElegidosEnOtrasFilas(items, index);
                const erroresFila = errors.items?.[index];
                const excedeStock = epp && cantidad > 0 && cantidad > epp.stockEPP;

                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-[1fr_6rem_auto] items-start gap-2"
                  >
                    <div className="space-y-1">
                      <select
                        id={`items.${index}.eppId`}
                        aria-label={`EPP del ítem ${numeroFila}`}
                        disabled={isPending || isLoadingEpps}
                        aria-invalid={Boolean(erroresFila?.eppId)}
                        className="h-10 w-full rounded-control border border-border-strong bg-card px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-subtle disabled:text-foreground-muted aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error/15"
                        {...register(`items.${index}.eppId`, { valueAsNumber: true })}
                      >
                        <option value="0">-- Seleccioná un EPP activo --</option>
                        {activeEpps.map((item) => (
                          <option
                            key={item.id}
                            value={item.id}
                            disabled={elegidos.has(item.id)}
                          >
                            {item.nombreEPP} (Stock: {item.stockEPP})
                          </option>
                        ))}
                      </select>
                      {erroresFila?.eppId ? (
                        <p className="text-xs font-medium text-error">
                          {erroresFila.eppId.message}
                        </p>
                      ) : epp ? (
                        <p className="text-xs text-foreground-muted">
                          Stock disponible: {epp.stockEPP} unidades.
                        </p>
                      ) : null}
                      {excedeStock ? (
                        <p className="text-xs font-medium text-warning">
                          La cantidad supera el stock registrado en pañol.
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-1">
                      <Input
                        id={`items.${index}.cantidad`}
                        type="number"
                        min={1}
                        step={1}
                        aria-label={`Cantidad del ítem ${numeroFila}`}
                        disabled={isPending}
                        aria-invalid={Boolean(erroresFila?.cantidad)}
                        {...register(`items.${index}.cantidad`, { valueAsNumber: true })}
                      />
                      {erroresFila?.cantidad ? (
                        <p className="text-xs font-medium text-error">
                          {erroresFila.cantidad.message}
                        </p>
                      ) : null}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={isPending || fields.length === 1}
                      aria-label={`Quitar ítem ${numeroFila}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            {errorItems ? (
              <p className="text-xs font-medium text-error">{errorItems}</p>
            ) : null}

            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ eppId: 0, cantidad: 1 })}
                disabled={isPending || !puedeAgregarItem}
              >
                <Plus className="size-4" />
                Agregar ítem
              </Button>
              <span className="text-xs text-foreground-muted">
                {fields.length} de {MAX_ITEMS_REMITO} ítems
              </span>
            </div>
          </fieldset>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isPending || activeEpps.length === 0}
            >
              {isPending ? (
                <>
                  <Spinner className="size-4 mr-2" />
                  Registrando...
                </>
              ) : (
                "Registrar Entrega"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
