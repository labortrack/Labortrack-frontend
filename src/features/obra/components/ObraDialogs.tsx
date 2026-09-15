import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRightLeft,
  Building2,
  CheckCircle2,
  HardHat,
  Lock,
  Plus,
  Trash2,
  UserCheck,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEstadosObraActivos } from "../estado/hooks/useEstadosObra";
import { EstadoBadge } from "../estado/components/EstadoBadge";
import {
  asignarCapatazSchema,
  bajaObraSchema,
  createObraSchema,
  modifyObraSchema,
  transicionarEstadoObraSchema,
  type AsignarCapatazForm,
  type BajaObraForm,
  type CreateObraForm,
  type ModifyObraForm,
  type TransicionarEstadoObraForm,
} from "../schemas/obraSchemas";
import {
  useAsignarCapataz,
  useBajaObra,
  useCambiarEstadoObra,
  useCapatacesDisponibles,
  useCreateObra,
  useModifyObra,
} from "../hooks/useObras";
import type { ObraResponseDto } from "../types/obra.types";
import { CapatazAvatar } from "./CapatazAvatar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Textarea,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

// ─── Modal 1: Registrar Obra (Alta) ──────────────────────────────────────────

interface CreateObraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateObraDialog({
  open,
  onOpenChange,
}: CreateObraDialogProps) {
  const mutation = useCreateObra();
  const [submitError, setSubmitError] = useState<string>();

  const { data: capatacesDisponibles = [], isLoading: isLoadingCapataces } =
    useCapatacesDisponibles();

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateObraForm>({
    resolver: zodResolver(createObraSchema),
    defaultValues: {
      nombreObra: "",
      nomenclatura: "",
      pais: "Argentina",
      provincia: "",
      localidad: "",
      motivoCambio: "Alta inicial de frente de trabajo",
      idCapataz: undefined,
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
      setSubmitError(undefined);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(undefined);
    try {
      const created = await mutation.mutateAsync({
        nombreObra: values.nombreObra.trim(),
        nomenclatura: values.nomenclatura.trim().toUpperCase(),
        pais: values.pais.trim(),
        provincia: values.provincia.trim(),
        localidad: values.localidad.trim(),
        motivoCambio: values.motivoCambio.trim(),
        idCapataz: Number(values.idCapataz),
      });
      toast.success("Frente de trabajo registrado correctamente.", {
        description: `"${created.nombreObra}" ha sido dado de alta con estado inicial ${created.estadoActual}.`,
      });
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo registrar la obra.").message,
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Building2 className="size-5" />
            </span>
            <div>
              <DialogTitle>Registrar Nuevo Frente de Trabajo</DialogTitle>
              <DialogDescription>
                Complete los datos contractuales y de localización de la nueva obra.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0" noValidate>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {submitError ? (
              <Alert variant="error" className="mb-2">
                <AlertCircle className="mt-0.5 size-4" />
                {submitError}
              </Alert>
            ) : null}

            <FormField
              id="create-obra-nombre"
              label="Nombre de la Obra"
              error={errors.nombreObra?.message}
              required
            >
              <Input
                id="create-obra-nombre"
                placeholder="Ej: Torre Mendoza Centro"
                aria-invalid={Boolean(errors.nombreObra)}
                {...register("nombreObra")}
              />
            </FormField>

            <FormField
              id="create-obra-nomenclatura"
              label="Nomenclatura Contractual"
              error={errors.nomenclatura?.message}
              required
            >
              <Input
                id="create-obra-nomenclatura"
                placeholder="Ej: NOM-2026-04"
                aria-invalid={Boolean(errors.nomenclatura)}
                {...register("nomenclatura")}
              />
            </FormField>

            <div>
              <span className="mb-2 block text-xs font-semibold text-primary">
                Ubicación Geográfica
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField
                  id="create-obra-pais"
                  label="País"
                  error={errors.pais?.message}
                  required
                >
                  <Input
                    id="create-obra-pais"
                    placeholder="Argentina"
                    aria-invalid={Boolean(errors.pais)}
                    {...register("pais")}
                  />
                </FormField>

                <FormField
                  id="create-obra-provincia"
                  label="Provincia"
                  error={errors.provincia?.message}
                  required
                >
                  <Input
                    id="create-obra-provincia"
                    placeholder="Ej: Mendoza"
                    aria-invalid={Boolean(errors.provincia)}
                    {...register("provincia")}
                  />
                </FormField>

                <FormField
                  id="create-obra-localidad"
                  label="Localidad"
                  error={errors.localidad?.message}
                  required
                >
                  <Input
                    id="create-obra-localidad"
                    placeholder="Ej: Ciudad de Mendoza"
                    aria-invalid={Boolean(errors.localidad)}
                    {...register("localidad")}
                  />
                </FormField>
              </div>
            </div>

            <div>
              <span className="mb-2 block text-xs font-semibold text-primary">
                Jefatura y Responsable de Obra
              </span>
              <Controller
                name="idCapataz"
                control={control}
                render={({ field }) => (
                  <FormField
                    id="create-obra-capataz"
                    label="Capataz Responsable *"
                    error={errors.idCapataz?.message}
                    required
                  >
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(val) =>
                        field.onChange(val ? Number(val) : undefined)
                      }
                      disabled={
                        mutation.isPending ||
                        isLoadingCapataces ||
                        capatacesDisponibles.length === 0
                      }
                    >
                      <SelectTrigger
                        id="create-obra-capataz"
                        aria-invalid={Boolean(errors.idCapataz)}
                      >
                        <SelectValue
                          placeholder={
                            isLoadingCapataces
                              ? "Cargando capataces disponibles..."
                              : capatacesDisponibles.length === 0
                              ? "No hay capataces disponibles"
                              : "Seleccionar capataz responsable..."
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {capatacesDisponibles.map((c) => (
                          <SelectItem
                            key={c.idEmpleadoGrupo}
                            value={String(c.idEmpleadoGrupo)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {c.apellido}, {c.nombre}
                              </span>
                              <span className="text-xs text-foreground-muted">
                                (DNI: {c.dni})
                                {c.email ? ` • ${c.email}` : ""}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
              />

              {!isLoadingCapataces && capatacesDisponibles.length === 0 && (
                <div className="mt-2 rounded-lg bg-amber-500/10 p-3 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <span>
                    No hay capataces disponibles en el sistema. Asegúrese de que existan empleados
                    activos con la función <strong>Capataz</strong> en Estructura Laboral y que no
                    tengan frentes de trabajo activos a cargo.
                  </span>
                </div>
              )}
            </div>

            <FormField
              id="create-obra-motivo"
              label="Motivo / Justificación del Alta"
              error={errors.motivoCambio?.message}
              required
            >
              <Textarea
                id="create-obra-motivo"
                rows={2}
                placeholder="Indique la razón o acta de inicio para registrar este proyecto..."
                aria-invalid={Boolean(errors.motivoCambio)}
                {...register("motivoCambio")}
              />
            </FormField>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border bg-subtle">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Spinner className="text-white" />
                  Registrando...
                </>
              ) : (
                <>
                  <Plus className="mr-1.5 size-4" />
                  Registrar Obra
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Modal 2: Modificar Obra ────────────────────────────────────────────────

interface EditObraDialogProps {
  obra: ObraResponseDto | null;
  onOpenChange: (open: boolean) => void;
}

export function EditObraDialog({
  obra,
  onOpenChange,
}: EditObraDialogProps) {
  const mutation = useModifyObra();
  const [submitError, setSubmitError] = useState<string>();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ModifyObraForm>({
    resolver: zodResolver(modifyObraSchema),
    values: {
      nombreObra: obra?.nombreObra ?? "",
      pais: obra?.pais ?? "Argentina",
      provincia: obra?.provincia ?? "",
      localidad: obra?.localidad ?? "",
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
      setSubmitError(undefined);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!obra) return;
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync({
        id: obra.id,
        payload: {
          nombreObra: values.nombreObra.trim(),
          pais: values.pais.trim(),
          provincia: values.provincia.trim(),
          localidad: values.localidad.trim(),
        },
      });
      toast.success("Frente de trabajo actualizado correctamente.", {
        description: `"${values.nombreObra}" ha sido modificado.`,
      });
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo actualizar la obra.").message,
      );
    }
  });

  return (
    <Dialog open={Boolean(obra)} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-border bg-card">
          <DialogTitle>Modificar Frente de Trabajo</DialogTitle>
          <DialogDescription>
            La nomenclatura contractual no puede modificarse una vez registrada para asegurar la trazabilidad.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0" noValidate>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {submitError ? (
              <Alert variant="error" className="mb-2">
                <AlertCircle className="mt-0.5 size-4" />
                {submitError}
              </Alert>
            ) : null}

            <FormField
              id="edit-obra-nombre"
              label="Nombre de la Obra"
              error={errors.nombreObra?.message}
              required
            >
              <Input
                id="edit-obra-nombre"
                aria-invalid={Boolean(errors.nombreObra)}
                {...register("nombreObra")}
              />
            </FormField>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nomenclatura Contractual
              </label>
              <div className="relative">
                <Input
                  value={obra?.nomenclatura ?? ""}
                  disabled
                  className="cursor-not-allowed bg-subtle text-foreground-muted pr-8"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-foreground-muted" />
              </div>
              <p className="text-[11px] text-foreground-muted">
                Campo inmutable para garantizar la trazabilidad contractual.
              </p>
            </div>

            <div>
              <span className="mb-2 block text-xs font-semibold text-primary">
                Ubicación Geográfica
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField
                  id="edit-obra-pais"
                  label="País"
                  error={errors.pais?.message}
                  required
                >
                  <Input
                    id="edit-obra-pais"
                    aria-invalid={Boolean(errors.pais)}
                    {...register("pais")}
                  />
                </FormField>

                <FormField
                  id="edit-obra-provincia"
                  label="Provincia"
                  error={errors.provincia?.message}
                  required
                >
                  <Input
                    id="edit-obra-provincia"
                    aria-invalid={Boolean(errors.provincia)}
                    {...register("provincia")}
                  />
                </FormField>

                <FormField
                  id="edit-obra-localidad"
                  label="Localidad"
                  error={errors.localidad?.message}
                  required
                >
                  <Input
                    id="edit-obra-localidad"
                    aria-invalid={Boolean(errors.localidad)}
                    {...register("localidad")}
                  />
                </FormField>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border bg-subtle">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Spinner className="text-white" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-1.5 size-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Modal 3: Baja / Cierre Administrativo de Obra ─────────────────────────

interface CloseObraDialogProps {
  obra: ObraResponseDto | null;
  onOpenChange: (open: boolean) => void;
}

export function CloseObraDialog({
  obra,
  onOpenChange,
}: CloseObraDialogProps) {
  const mutation = useBajaObra();
  const [submitError, setSubmitError] = useState<string>();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<BajaObraForm>({
    resolver: zodResolver(bajaObraSchema),
    defaultValues: {
      motivoCambio: "Cierre administrativo de obra",
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
      setSubmitError(undefined);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!obra) return;
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync({
        id: obra.id,
        payload: {
          motivoCambio: values.motivoCambio.trim(),
        },
      });
      toast.success("Frente de trabajo suspendido / dado de baja.", {
        description: `"${obra.nombreObra}" ha sido transicionada al estado final.`,
      });
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo suspender la obra.").message,
      );
    }
  });

  return (
    <Dialog open={Boolean(obra)} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-error-soft text-error">
              <AlertTriangle className="size-6 text-error" />
            </div>
            <div>
              <DialogTitle>Cierre / Baja de Obra</DialogTitle>
              {obra ? (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded bg-subtle px-2 py-0.5 text-xs text-foreground">
                    <Building2 className="size-3 text-foreground-muted" />
                    <span>{obra.nombreObra}</span>
                  </span>
                  <EstadoBadge estado={obra.estadoActual} />
                </div>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        {submitError ? (
          <Alert variant="error" className="mb-2">
            <AlertCircle className="mt-0.5 size-4" />
            {submitError}
          </Alert>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-3" noValidate>
          <DialogDescription className="text-sm leading-relaxed text-foreground-muted">
            ¿Está seguro de que desea suspender o dar de baja este frente de trabajo? Se cerrará el estado vigente actual y se transicionará al estado de cierre.
          </DialogDescription>

          <FormField
            id="baja-motivo"
            label="Motivo de la baja"
            error={errors.motivoCambio?.message}
            required
          >
            <Textarea
              id="baja-motivo"
              rows={3}
              placeholder="Indique la causa o resolución del cierre..."
              aria-invalid={Boolean(errors.motivoCambio)}
              {...register("motivoCambio")}
            />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Spinner className="text-white" />
                  Procesando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-1.5 size-4" />
                  Confirmar Cierre
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Modal 4: Transicionar Estado de Obra ───────────────────────────────────

interface TransicionarEstadoObraDialogProps {
  obra: ObraResponseDto | null;
  onOpenChange: (open: boolean) => void;
}

export function TransicionarEstadoObraDialog({
  obra,
  onOpenChange,
}: TransicionarEstadoObraDialogProps) {
  const mutation = useCambiarEstadoObra();
  const estadosActivosQuery = useEstadosObraActivos();
  const [submitError, setSubmitError] = useState<string>();

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<TransicionarEstadoObraForm>({
    resolver: zodResolver(transicionarEstadoObraSchema),
    defaultValues: {
      motivoCambio: "",
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
      setSubmitError(undefined);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!obra) return;
    setSubmitError(undefined);
    try {
      const updated = await mutation.mutateAsync({
        id: obra.id,
        payload: {
          idEstadoObra: Number(values.idEstadoObra),
          motivoCambio: values.motivoCambio.trim(),
        },
      });
      toast.success("Estado de obra actualizado correctamente.", {
        description: `"${updated.nombreObra}" transicionó a "${updated.estadoActual}".`,
      });
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(
          error,
          "No se pudo cambiar el estado de la obra.",
        ).message,
      );
    }
  });

  const estadosDisponibles = (estadosActivosQuery.data ?? []).filter(
    (e) => e.nombreEstadoObra.toUpperCase() !== obra?.estadoActual?.toUpperCase(),
  );

  return (
    <Dialog open={Boolean(obra)} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <ArrowRightLeft className="size-5" />
            </span>
            <div>
              <DialogTitle>Transicionar Estado de Obra</DialogTitle>
              {obra ? (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    {obra.nombreObra}
                  </span>
                  <span className="text-xs text-foreground-muted">— Actual:</span>
                  <EstadoBadge estado={obra.estadoActual} />
                </div>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        {submitError ? (
          <Alert variant="error" className="mb-2">
            <AlertCircle className="mt-0.5 size-4" />
            {submitError}
          </Alert>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormField
            id="transicion-nuevo-estado"
            label="Nuevo Estado"
            error={errors.idEstadoObra?.message}
            required
          >
            <Controller
              control={control}
              name="idEstadoObra"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(val) => field.onChange(Number(val))}
                  disabled={estadosActivosQuery.isPending}
                >
                  <SelectTrigger id="transicion-nuevo-estado">
                    <SelectValue placeholder="Seleccionar nuevo estado de obra..." />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosDisponibles.map((est) => (
                      <SelectItem key={est.id} value={String(est.id)}>
                        <div className="flex items-center gap-2">
                          <EstadoBadge estado={est.nombreEstadoObra} />
                          {est.descripcionEstadoObra ? (
                            <span className="text-xs text-foreground-muted">
                              — {est.descripcionEstadoObra}
                            </span>
                          ) : null}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField
            id="transicion-motivo"
            label="Motivo del Cambio de Estado"
            error={errors.motivoCambio?.message}
            required
          >
            <Textarea
              id="transicion-motivo"
              rows={3}
              placeholder="Indique la causa o resolución técnica que motiva este cambio de estado..."
              aria-invalid={Boolean(errors.motivoCambio)}
              {...register("motivoCambio")}
            />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Spinner className="text-white" />
                  Actualizando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-1.5 size-4" />
                  Aplicar Transición
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Modal 5: Asignar / Cambiar Capataz ──────────────────────────────────────────

interface AsignarCapatazDialogProps {
  obra: ObraResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AsignarCapatazDialog({
  obra,
  open,
  onOpenChange,
}: AsignarCapatazDialogProps) {
  const mutation = useAsignarCapataz();
  const [submitError, setSubmitError] = useState<string>();

  // Consultar capataces disponibles excluyendo la obra actual para evitar conflictos
  const { data: capatacesDisponibles = [], isLoading: isLoadingCapataces } =
    useCapatacesDisponibles(obra?.id);

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<AsignarCapatazForm>({
    resolver: zodResolver(asignarCapatazSchema),
    defaultValues: {
      idCapataz: undefined,
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
      setSubmitError(undefined);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!obra) return;
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync({
        id: obra.id,
        payload: {
          idCapataz: Number(values.idCapataz),
        },
      });
      toast.success("Capataz asignado correctamente.", {
        description: `Se ha actualizado la jefatura de obra para "${obra.nombreObra}".`,
      });
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo asignar el capataz.").message,
      );
    }
  });

  if (!obra) return null;

  const isFinalizada =
    obra.estadoActual.toUpperCase() === "SUSPENDIDA" ||
    obra.estadoActual.toUpperCase() === "FINALIZADA" ||
    obra.estadoActual.toUpperCase() === "ARCHIVADA";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <HardHat className="size-5" />
            </span>
            <div>
              <DialogTitle>
                {obra.capataz ? "Cambiar Capataz" : "Asignar Capataz Responsable"}
              </DialogTitle>
              <DialogDescription>
                {obra.nombreObra} ({obra.nomenclatura})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col" noValidate>
          <div className="px-6 py-5 space-y-4">
            {submitError && (
              <Alert variant="error">
                <AlertCircle className="mt-0.5 size-4" />
                {submitError}
              </Alert>
            )}

            {isFinalizada && (
              <Alert variant="warning">
                <AlertTriangle className="mt-0.5 size-4" />
                No es posible asignar o modificar el capataz de una obra en estado{" "}
                <strong>{obra.estadoActual}</strong>.
              </Alert>
            )}

            {obra.capataz ? (
              <div className="rounded-lg border border-border bg-subtle/60 p-3.5 space-y-2">
                <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block">
                  Capataz Asignado Actualmente
                </span>
                <div className="flex items-center gap-3">
                  <CapatazAvatar
                    nombre={`${obra.capataz.nombre} ${obra.capataz.apellido}`}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {obra.capataz.nombre} {obra.capataz.apellido}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      DNI: {obra.capataz.dni}
                      {obra.capataz.email ? ` • ${obra.capataz.email}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0" />
                <span>Esta obra no tiene actualmente un capataz responsable asignado.</span>
              </div>
            )}

            <div>
              <Controller
                name="idCapataz"
                control={control}
                render={({ field }) => (
                  <FormField
                    id="asignar-capataz-select"
                    label="Seleccionar Nuevo Capataz *"
                    error={errors.idCapataz?.message}
                    required
                  >
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(val) =>
                        field.onChange(val ? Number(val) : undefined)
                      }
                      disabled={
                        mutation.isPending ||
                        isLoadingCapataces ||
                        isFinalizada ||
                        capatacesDisponibles.length === 0
                      }
                    >
                      <SelectTrigger
                        id="asignar-capataz-select"
                        aria-invalid={Boolean(errors.idCapataz)}
                      >
                        <SelectValue
                          placeholder={
                            isLoadingCapataces
                              ? "Cargando capataces disponibles..."
                              : capatacesDisponibles.length === 0
                              ? "No hay otros capataces disponibles"
                              : "Seleccionar capataz..."
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {capatacesDisponibles.map((c) => {
                          const esCapatazActual =
                            obra.capataz != null &&
                            obra.capataz.idEmpleadoGrupo === c.idEmpleadoGrupo;
                          return (
                            <SelectItem
                              key={c.idEmpleadoGrupo}
                              value={String(c.idEmpleadoGrupo)}
                              disabled={esCapatazActual}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {c.apellido}, {c.nombre}
                                </span>
                                <span className="text-xs text-foreground-muted">
                                  (DNI: {c.dni})
                                </span>
                                {esCapatazActual && (
                                  <span className="text-xs font-semibold text-primary">
                                    — Asignado actualmente
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
              />

              {!isLoadingCapataces && capatacesDisponibles.length === 0 && (
                <div className="mt-2 rounded-lg bg-subtle p-3 text-xs text-foreground-muted flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>
                    No hay capataces libres disponibles para asignación. Asegúrese de que existan
                    empleados activos en el grupo Capataz sin asignación a otra obra activa.
                  </span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border bg-subtle">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                mutation.isPending ||
                isFinalizada ||
                isLoadingCapataces ||
                capatacesDisponibles.length === 0
              }
            >
              {mutation.isPending ? (
                <>
                  <Spinner className="text-white" />
                  Guardando...
                </>
              ) : (
                <>
                  <UserCheck className="mr-1.5 size-4" />
                  Confirmar Capataz
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

