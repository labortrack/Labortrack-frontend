import { MapPin, Tag, Calculator } from "lucide-react";
import { ZonaTab } from "./ZonaTab";
import { CategoriaUocraTab } from "./CategoriaUocraTab";
import { CategoriaZonaTab } from "./CategoriaZonaTab";
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

export function EditarCuadroTarifarioDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-5xl flex-col overflow-y-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Editar Cuadro Tarifario UOCRA</DialogTitle>
          <DialogDescription>
            Administrá las zonas, las categorías y los valores económicos que
            componen el cuadro tarifario.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="zonas" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="shrink-0">
            <TabsTrigger value="zonas" className="gap-1.5">
              <MapPin className="size-4" />
              Zonas
            </TabsTrigger>
            <TabsTrigger value="categorias" className="gap-1.5">
              <Tag className="size-4" />
              Categorías UOCRA
            </TabsTrigger>
            <TabsTrigger value="valores" className="gap-1.5">
              <Calculator className="size-4" />
              Valores por Zona y Categoría
            </TabsTrigger>
          </TabsList>

          <TabsContent value="zonas" className="min-h-0 flex-1 overflow-y-auto">
            <ZonaTab />
          </TabsContent>

          <TabsContent
            value="categorias"
            className="min-h-0 flex-1 overflow-y-auto"
          >
            <CategoriaUocraTab />
          </TabsContent>

          <TabsContent
            value="valores"
            className="min-h-0 flex-1 overflow-y-auto"
          >
            <CategoriaZonaTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
