import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Box, Tag } from "lucide-react";
import { toast } from "sonner";
import type { Epp } from "../../types/epp.types";
import {
  altaEppSchema,
  modificarEppSchema,
  type AltaEppForm,
  type ModificarEppForm,
} from "../../schemas/epp.schemas";
import { useCreateEpp, useUpdateEpp } from "../../hooks/useEpp";
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

interface EppFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  epp?: Epp | null;
}

type FormValues = AltaEppForm | ModificarEppForm;

export function EppFormModal({
  open,
  onOpenChange,
  epp,
}: EppFormModalProps) {
  const isEdit = Boolean(epp);
  const [submitError, setSubmitError] = useState<string>();

  const createMutation = useCreateEpp();
  const updateMutation = useUpdateEpp();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? modificarEppSchema : altaEppSchema),
    values: epp
      ? {
          nombreEPP: epp.nombreEPP,
          stockEPP: epp.stockEPP,
        }
      : undefined,
    defaultValues: {
      nombreEPP: "",
      stockEPP: 1,
    },
  });

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
      setSubmitError(undefined);
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(undefined);
    try {
      if (isEdit && epp) {
        await updateMutation.mutateAsync({
          id: epp.id,
          payload: {
            nombreEPP: values.nombreEPP.trim(),
            stockEPP: values.stockEPP,
          },
        });
        toast.success("EPP actualizado correctamente", {
          description: `Se han guardado los cambios para "${values.nombreEPP}".`,
        });
      } else {
        await createMutation.mutateAsync({
          nombreEPP: values.nombreEPP.trim(),
          stockEPP: values.stockEPP ?? 1,
        });
        toast.success("EPP registrado con éxito", {
          description: `"${values.nombreEPP}" fue añadido al inventario.`,
        });
      }
      handleClose(false);
    } catch (err) {
      const normalized = normalizeApiError(
        err,
        isEdit
          ? "No se pudo actualizar el EPP."
          : "No se pudo dar de alta el EPP.",
      );
      setSubmitError(normalized.message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modificar EPP" : "Nuevo Elemento de Protección"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualizá la información técnica y el stock del EPP seleccionado."
              : "Ingresá los datos del nuevo equipo de protección para incorporarlo al pañol."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {submitError ? (
            <Alert variant="error" className="flex items-start gap-2 text-sm">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </Alert>
          ) : null}

          <FormField
            id="nombreEPP"
            label="Nombre del EPP"
            icon={Tag}
            required
            error={errors.nombreEPP?.message}
          >
            <Input
              id="nombreEPP"
              placeholder="Ej: Casco de Seguridad Dieléctrico"
              disabled={isPending}
              aria-invalid={Boolean(errors.nombreEPP)}
              {...register("nombreEPP")}
            />
          </FormField>

          <FormField
            id="stockEPP"
            label={isEdit ? "Stock Disponible" : "Stock Inicial"}
            icon={Box}
            required
            hint="Debe ser un número entero mayor a cero."
            error={errors.stockEPP?.message}
          >
            <Input
              id="stockEPP"
              type="number"
              min={1}
              step={1}
              placeholder="Ej: 50"
              disabled={isPending}
              aria-invalid={Boolean(errors.stockEPP)}
              {...register("stockEPP", { valueAsNumber: true })}
            />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner className="size-4 mr-2" />
                  Guardando...
                </>
              ) : isEdit ? (
                "Guardar Cambios"
              ) : (
                "Registrar EPP"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
