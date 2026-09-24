import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Calendar,
  ClipboardCheck,
  Package,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  nuevaEntregaSchema,
  type NuevaEntregaForm,
} from "../../schemas/epp.schemas";
import { useAsignarEpp, useEpps } from "../../hooks/useEpp";
import { useEmpleadosActivos } from "@/features/estructuraLaboral/hooks/useEstructuraLaboral";
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

interface EppDeliveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEppId?: number;
}

export function EppDeliveryModal({
  open,
  onOpenChange,
  initialEppId,
}: EppDeliveryModalProps) {
  const [submitError, setSubmitError] = useState<string>();
  const asignarMutation = useAsignarEpp();
  const isPending = asignarMutation.isPending;

  // Catálogos
  const { data: epps = [], isLoading: isLoadingEpps } = useEpps();
  const activeEpps = epps.filter((epp) => epp.activo);

  const { data: empleadosData, isLoading: isLoadingEmpleados } =
    useEmpleadosActivos();
  const empleados = empleadosData?.content ?? [];

  const todayStr = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<NuevaEntregaForm>({
    resolver: zodResolver(nuevaEntregaSchema),
    values: initialEppId
      ? {
          eppId: initialEppId,
          empleadoId: 0,
          cantidadEntregada: 1,
          fechaEntrega: todayStr,
        }
      : undefined,
    defaultValues: {
      eppId: initialEppId ?? 0,
      empleadoId: 0,
      cantidadEntregada: 1,
      fechaEntrega: todayStr,
    },
  });

  const selectedEppId = useWatch({ control, name: "eppId" });
  const cantidadEntregada = useWatch({ control, name: "cantidadEntregada" });

  const selectedEpp = activeEpps.find(
    (item) => item.id === Number(selectedEppId),
  );
  const exceedsStock =
    selectedEpp &&
    Number(cantidadEntregada) > 0 &&
    Number(cantidadEntregada) > selectedEpp.stockEPP;

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset({
        eppId: 0,
        empleadoId: 0,
        cantidadEntregada: 1,
        fechaEntrega: todayStr,
      });
      setSubmitError(undefined);
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(undefined);

    try {
      await asignarMutation.mutateAsync({
        empleadoId: Number(values.empleadoId),
        eppId: Number(values.eppId),
        cantidadEntregada: Number(values.cantidadEntregada),
        fechaEntrega: values.fechaEntrega,
      });

      const empleadoNombre =
        empleados.find((e) => e.id === Number(values.empleadoId))
          ? `${empleados.find((e) => e.id === Number(values.empleadoId))?.apellido}, ${empleados.find((e) => e.id === Number(values.empleadoId))?.nombre}`
          : `Empleado #${values.empleadoId}`;

      const eppNombre = selectedEpp?.nombreEPP ?? `EPP #${values.eppId}`;

      toast.success("Entrega registrada correctamente", {
        description: `Se entregaron ${values.cantidadEntregada}x ${eppNombre} a ${empleadoNombre}.`,
      });
      handleClose(false);
    } catch (err) {
      const normalized = normalizeApiError(
        err,
        "No se pudo registrar la entrega del EPP.",
      );
      setSubmitError(normalized.message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="size-5 text-primary" />
            Registrar Entrega de EPP
          </DialogTitle>
          <DialogDescription>
            Asigná equipo de protección personal individual a un operario o empleado activo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {submitError ? (
            <Alert variant="error" className="flex items-start gap-2 text-sm">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </Alert>
          ) : null}

          {/* Selector de Empleado */}
          <FormField
            id="empleadoId"
            label="Empleado Destinatario"
            icon={User}
            required
            hint={
              isLoadingEmpleados
                ? "Cargando nómina de empleados..."
                : empleados.length === 0
                  ? "No se encontraron empleados activos."
                  : undefined
            }
            error={errors.empleadoId?.message}
          >
            <select
              id="empleadoId"
              disabled={isPending || isLoadingEmpleados}
              aria-invalid={Boolean(errors.empleadoId)}
              className="h-10 w-full rounded-control border border-border-strong bg-card px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-subtle disabled:text-foreground-muted aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error/15"
              {...register("empleadoId")}
            >
              <option value="0">-- Seleccioná un empleado --</option>
              {empleados.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.apellido}, {emp.nombre} (DNI: {emp.dni})
                </option>
              ))}
            </select>
          </FormField>

          {/* Selector de EPP */}
          <FormField
            id="eppId"
            label="Elemento de Protección (EPP)"
            icon={ShieldCheck}
            required
            hint={
              isLoadingEpps
                ? "Cargando catálogo de EPP..."
                : activeEpps.length === 0
                  ? "No hay EPPs activos disponibles para entrega."
                  : selectedEpp
                    ? `Stock actual disponible: ${selectedEpp.stockEPP} unidades.`
                    : undefined
            }
            error={errors.eppId?.message}
          >
            <select
              id="eppId"
              disabled={isPending || isLoadingEpps}
              aria-invalid={Boolean(errors.eppId)}
              className="h-10 w-full rounded-control border border-border-strong bg-card px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-subtle disabled:text-foreground-muted aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error/15"
              {...register("eppId")}
            >
              <option value="0">-- Seleccioná un EPP activo --</option>
              {activeEpps.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombreEPP} (Stock: {item.stockEPP})
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Cantidad a entregar */}
            <FormField
              id="cantidadEntregada"
              label="Cantidad a Entregar"
              icon={Package}
              required
              error={errors.cantidadEntregada?.message}
            >
              <Input
                id="cantidadEntregada"
                type="number"
                min={1}
                step={1}
                placeholder="Ej: 1"
                disabled={isPending}
                aria-invalid={Boolean(errors.cantidadEntregada)}
                {...register("cantidadEntregada")}
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
                disabled={isPending}
                aria-invalid={Boolean(errors.fechaEntrega)}
                {...register("fechaEntrega")}
              />
            </FormField>
          </div>

          {/* Alerta si la entrega excede el stock */}
          {exceedsStock ? (
            <Alert variant="warning" className="text-xs">
              Atención: La cantidad a entregar ({cantidadEntregada}) supera el stock
              registrado en pañol ({selectedEpp?.stockEPP}).
            </Alert>
          ) : null}

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
