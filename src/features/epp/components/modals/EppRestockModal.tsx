import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowUpRight, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import type { Epp } from "../../types/epp.types";
import {
  reponerEppSchema,
  type ReponerEppForm,
} from "../../schemas/epp.schemas";
import { useReponerStockEpp } from "../../hooks/useEpp";
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

interface EppRestockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  epp: Epp | null;
}

export function EppRestockModal({
  open,
  onOpenChange,
  epp,
}: EppRestockModalProps) {
  const [submitError, setSubmitError] = useState<string>();
  const restockMutation = useReponerStockEpp();
  const isPending = restockMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ReponerEppForm>({
    resolver: zodResolver(reponerEppSchema),
    defaultValues: {
      cantidadReponer: 1,
    },
  });

  const cantidadReponer = useWatch({ control, name: "cantidadReponer" });

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset({ cantidadReponer: 1 });
      setSubmitError(undefined);
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!epp) return;
    setSubmitError(undefined);

    try {
      await restockMutation.mutateAsync({
        id: epp.id,
        payload: { cantidadReponer: values.cantidadReponer },
      });
      toast.success("Stock repuesto exitosamente", {
        description: `Se ingresaron ${values.cantidadReponer} unidades para "${epp.nombreEPP}".`,
      });
      handleClose(false);
    } catch (err) {
      const normalized = normalizeApiError(
        err,
        "No se pudo registrar la reposición de stock.",
      );
      setSubmitError(normalized.message);
    }
  });

  const stockActual = epp?.stockEPP ?? 0;
  const cantidadValida = Number(cantidadReponer) > 0 ? Number(cantidadReponer) : 0;
  const stockResultante = stockActual + cantidadValida;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="size-5 text-primary" />
            Reponer Stock en Pañol
          </DialogTitle>
          <DialogDescription>
            Registrá el ingreso de nuevas unidades de protección personal al depósito.
          </DialogDescription>
        </DialogHeader>

        {epp ? (
          <div className="rounded-card border border-border bg-subtle p-3.5 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Elemento a reponer
            </span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground text-sm">
                {epp.nombreEPP}
              </span>
              <span className="text-xs font-medium text-foreground-muted">
                Stock actual: <strong className="text-foreground">{stockActual}</strong>
              </span>
            </div>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          {submitError ? (
            <Alert variant="error" className="flex items-start gap-2 text-sm">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </Alert>
          ) : null}

          <FormField
            id="cantidadReponer"
            label="Cantidad a Ingresar"
            icon={ArrowUpRight}
            required
            hint="Indica cuántas unidades nuevas ingresan al pañol."
            error={errors.cantidadReponer?.message}
          >
            <Input
              id="cantidadReponer"
              type="number"
              min={1}
              step={1}
              placeholder="Ej: 25"
              disabled={isPending}
              aria-invalid={Boolean(errors.cantidadReponer)}
              {...register("cantidadReponer")}
            />
          </FormField>

          {/* Visualización del stock resultante */}
          {epp && cantidadValida > 0 ? (
            <div className="flex items-center justify-between rounded-control border border-border/60 bg-muted/40 px-3 py-2 text-xs">
              <span className="text-foreground-muted">Nuevo stock proyectado:</span>
              <span className="font-bold text-success text-sm">
                {stockResultante} unidades
              </span>
            </div>
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
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner className="size-4 mr-2" />
                  Reponiendo...
                </>
              ) : (
                "Confirmar Ingreso"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
