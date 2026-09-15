import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
} from "@/shared/ui";
import { useModifyCuadrilla } from "../../hooks/useCuadrillas";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { AlertCircle } from "lucide-react";
import type { CuadrillaResponseDto } from "../../types/cuadrilla.types";

interface EditCuadrillaDialogProps {
  obraId: number;
  cuadrilla: CuadrillaResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCuadrillaDialog({
  obraId,
  cuadrilla,
  open,
  onOpenChange,
}: EditCuadrillaDialogProps) {
  const [nombre, setNombre] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const modifyMutation = useModifyCuadrilla(obraId);

  useEffect(() => {
    if (cuadrilla) {
      setNombre(cuadrilla.nombre);
      setErrorMsg(null);
    }
  }, [cuadrilla]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuadrilla) return;
    setErrorMsg(null);

    if (!nombre.trim()) {
      setErrorMsg("El nombre de la cuadrilla es obligatorio.");
      return;
    }

    try {
      await modifyMutation.mutateAsync({
        cuadrillaId: cuadrilla.id,
        payload: {
          nombre: nombre.trim(),
          idObra: obraId,
        },
      });
      onOpenChange(false);
    } catch (err) {
      setErrorMsg(
        normalizeApiError(err, "No se pudo modificar la cuadrilla.").message
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Modificar Cuadrilla</DialogTitle>
            <DialogDescription>
              Actualiza el nombre identificador de la cuadrilla.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {errorMsg && (
              <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-md flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="edit-nombre" className="text-xs font-semibold">
                Nombre de la Cuadrilla *
              </Label>
              <Input
                id="edit-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={modifyMutation.isPending}
                className="text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={modifyMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={modifyMutation.isPending}>
              {modifyMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
