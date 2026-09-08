import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAsignarCategoria } from "../hooks/useEmpleadoCategoria";
import { useCategoriasUocraActivas } from "@/features/cuadroTarifario/hooks/useCategoriasUocra";
import { useZonasActivas } from "@/features/cuadroTarifario/hooks/useZonas";
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
} from "@/shared/ui";
import { FormField } from "@/shared/components";
import { normalizeApiError } from "@/shared/lib/http/apiError";

export function CambiarCategoriaDialog({
  empleadoId,
  nombreCompleto,
  categoriaActualId,
  categoriaActualNombre,
  zonaActualId,
  zonaActualNombre,
  open,
  onOpenChange,
}: {
  empleadoId: number;
  nombreCompleto: string;
  categoriaActualId?: number;
  categoriaActualNombre?: string;
  zonaActualId?: number;
  zonaActualNombre?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useAsignarCategoria();
  const categoriasQuery = useCategoriasUocraActivas();
  const zonasQuery = useZonasActivas();

  // La categoría/zona vigente puede haber sido dada de baja desde entonces: la
  // incluimos igual como opción para que el valor actual siempre se pueda mostrar.
  const categoriaOptions = useMemo(() => {
    const base = categoriasQuery.data ?? [];
    if (
      categoriaActualId &&
      !base.some((categoria) => categoria.id === categoriaActualId)
    ) {
      return [
        {
          id: categoriaActualId,
          nombreCategoria: categoriaActualNombre ?? `Categoría #${categoriaActualId}`,
        },
        ...base,
      ];
    }
    return base;
  }, [categoriasQuery.data, categoriaActualId, categoriaActualNombre]);

  const zonaOptions = useMemo(() => {
    const base = zonasQuery.data ?? [];
    if (zonaActualId && !base.some((zona) => zona.id === zonaActualId)) {
      return [
        { id: zonaActualId, nombreZona: zonaActualNombre ?? `Zona #${zonaActualId}` },
        ...base,
      ];
    }
    return base;
  }, [zonasQuery.data, zonaActualId, zonaActualNombre]);

  // Se precargan como punto de partida; el llamador remonta el diálogo (via `key`)
  // cada vez que cambia la asignación vigente para mantener estos valores al día.
  const [idCategoriaUocra, setIdCategoriaUocra] = useState<number | undefined>(
    categoriaActualId,
  );
  const [idZona, setIdZona] = useState<number | undefined>(zonaActualId);
  const [submitError, setSubmitError] = useState<string>();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setIdCategoriaUocra(undefined);
      setIdZona(undefined);
      setSubmitError(undefined);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async () => {
    if (!idCategoriaUocra || !idZona) {
      setSubmitError("Seleccioná una categoría y una zona.");
      return;
    }
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync({ idEmpleado: empleadoId, idCategoriaUocra, idZona });
      toast.success("Categoría UOCRA actualizada correctamente.", {
        description: `Se registró la nueva asignación para ${nombreCompleto}.`,
      });
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo cambiar la categoría.").message,
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <DialogTitle>Cambiar Categoría UOCRA</DialogTitle>
              <DialogDescription>
                La asignación anterior de {nombreCompleto} se cierra
                automáticamente y queda guardada en el historial.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {submitError ? (
          <Alert variant="error" className="mb-4">
            <AlertCircle className="mt-0.5 size-4" />
            {submitError}
          </Alert>
        ) : null}

        <div className="space-y-4">
          <FormField id="cambiar-categoria-categoria" label="Categoría UOCRA" required>
            <Select
              value={idCategoriaUocra ? String(idCategoriaUocra) : ""}
              onValueChange={(val) => setIdCategoriaUocra(Number(val))}
            >
              <SelectTrigger id="cambiar-categoria-categoria">
                <SelectValue placeholder="Seleccioná una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categoriaOptions.map((categoria) => (
                  <SelectItem key={categoria.id} value={String(categoria.id)}>
                    {categoria.nombreCategoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="cambiar-categoria-zona" label="Zona" required>
            <Select
              value={idZona ? String(idZona) : ""}
              onValueChange={(val) => setIdZona(Number(val))}
            >
              <SelectTrigger id="cambiar-categoria-zona">
                <SelectValue placeholder="Seleccioná una zona" />
              </SelectTrigger>
              <SelectContent>
                {zonaOptions.map((zona) => (
                  <SelectItem key={zona.id} value={String(zona.id)}>
                    {zona.nombreZona}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Spinner className="text-white" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 size-4" />
                Confirmar Cambio
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
