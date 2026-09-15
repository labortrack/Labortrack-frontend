import { useState } from "react";
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui";
import { useCreateCuadrilla, useGrupos } from "../../hooks/useCuadrillas";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { AlertCircle } from "lucide-react";

interface CreateCuadrillaDialogProps {
  obraId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCuadrillaDialog({
  obraId,
  open,
  onOpenChange,
}: CreateCuadrillaDialogProps) {
  const [nombre, setNombre] = useState("");
  const [grupoId, setGrupoId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: gruposData, isLoading: isLoadingGrupos } = useGrupos();
  const grupos = gruposData?.content ?? [];

  const createMutation = useCreateCuadrilla(obraId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nombre.trim()) {
      setErrorMsg("El nombre de la cuadrilla es obligatorio.");
      return;
    }
    if (!grupoId) {
      setErrorMsg("Debes seleccionar una especialidad/grupo para la cuadrilla.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        nombre: nombre.trim(),
        idObra: obraId,
        idGrupo: Number(grupoId),
      });
      setNombre("");
      setGrupoId("");
      onOpenChange(false);
    } catch (err) {
      setErrorMsg(
        normalizeApiError(err, "No se pudo crear la cuadrilla.").message
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nueva Cuadrilla</DialogTitle>
            <DialogDescription>
              Crea una cuadrilla para asignar operarios y gestionar planes de trabajo en esta obra.
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
              <Label htmlFor="nombre" className="text-xs font-semibold">
                Nombre de la Cuadrilla *
              </Label>
              <Input
                id="nombre"
                placeholder="Ej. Cuadrilla Hormigón A"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={createMutation.isPending}
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="grupo" className="text-xs font-semibold">
                Especialidad / Grupo *
              </Label>
              <Select
                value={grupoId}
                onValueChange={setGrupoId}
                disabled={createMutation.isPending || isLoadingGrupos}
              >
                <SelectTrigger id="grupo" className="text-sm">
                  <SelectValue placeholder={isLoadingGrupos ? "Cargando grupos..." : "Seleccionar especialidad"} />
                </SelectTrigger>
                <SelectContent>
                  {grupos.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>
                      {g.tipoActividad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creando..." : "Crear Cuadrilla"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
