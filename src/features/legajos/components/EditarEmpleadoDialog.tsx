import { ShieldCheck, User } from "lucide-react";
import { EmpleadoForm } from "./EmpleadoForm";
import { CambiarCategoriaForm } from "./CambiarCategoriaForm";
import { useHistorialCategoria } from "../hooks/useEmpleadoCategoria";
import { LoadingState } from "@/shared/components";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui";

export function EditarEmpleadoDialog({
  empleadoId,
  nombreCompleto,
  open,
  onOpenChange,
}: {
  empleadoId: number;
  nombreCompleto: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const historialQuery = useHistorialCategoria(open ? empleadoId : null);
  const categoriaVigente = historialQuery.data?.find((item) => !item.fechaHasta);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-4xl flex-col overflow-y-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Editar Legajo — {nombreCompleto}</DialogTitle>
          <DialogDescription>
            Actualizá los datos de contacto o la categoría y zona asignadas.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="datos" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="shrink-0">
            <TabsTrigger value="datos" className="gap-1.5">
              <User className="size-4" />
              Datos del Legajo
            </TabsTrigger>
            <TabsTrigger value="categoria" className="gap-1.5">
              <ShieldCheck className="size-4" />
              Categoría / Zona
            </TabsTrigger>
          </TabsList>

          <TabsContent value="datos" className="min-h-0 flex-1 overflow-y-auto">
            <EmpleadoForm
              empleadoId={empleadoId}
              onSuccess={() => onOpenChange(false)}
              onCancel={() => onOpenChange(false)}
            />
          </TabsContent>

          <TabsContent value="categoria" className="min-h-0 flex-1 overflow-y-auto">
            {historialQuery.isPending ? (
              <LoadingState label="Cargando categoría vigente..." />
            ) : (
              <CambiarCategoriaForm
                key={categoriaVigente?.id ?? "cambiar-categoria"}
                empleadoId={empleadoId}
                nombreCompleto={nombreCompleto}
                categoriaActualId={categoriaVigente?.categoriaUOCRAId}
                categoriaActualNombre={categoriaVigente?.nombreCategoria}
                zonaActualId={categoriaVigente?.zonaId}
                zonaActualNombre={categoriaVigente?.nombreZona}
                onDone={() => onOpenChange(false)}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
