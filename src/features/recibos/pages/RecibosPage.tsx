import {
  CalendarClock,
  FileText,
  MinusCircle,
  PlusCircle,
  Table2,
} from "lucide-react";
import { CuadroTarifarioTab } from "@/features/cuadroTarifario/components/CuadroTarifarioTab";
import { ComingSoonPanel } from "../components/ComingSoonPanel";
import { PageHeader } from "@/shared/components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui";

export default function RecibosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Recibos"
        description="Gestión de recibos de sueldo y liquidaciones de haberes."
      />

      <Tabs defaultValue="cuadro-tarifario">
        <TabsList className="flex-wrap">
          <TabsTrigger value="recibos" className="gap-1.5">
            <FileText className="size-4" />
            Recibos de Sueldo
          </TabsTrigger>
          <TabsTrigger value="cuadro-tarifario" className="gap-1.5">
            <Table2 className="size-4" />
            Configuración Cuadros Tarifarios
          </TabsTrigger>
          <TabsTrigger value="periodos" className="gap-1.5">
            <CalendarClock className="size-4" />
            Configuración Períodos
          </TabsTrigger>
          <TabsTrigger value="conceptos" className="gap-1.5">
            <PlusCircle className="size-4" />
            Conceptos
          </TabsTrigger>
          <TabsTrigger value="deducciones" className="gap-1.5">
            <MinusCircle className="size-4" />
            Deducciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recibos">
          <ComingSoonPanel
            title="Recibos de Sueldo"
            description="Generación de pre-liquidación, ajuste y consulta de recibos de sueldo."
          />
        </TabsContent>

        <TabsContent value="cuadro-tarifario">
          <CuadroTarifarioTab />
        </TabsContent>

        <TabsContent value="periodos">
          <ComingSoonPanel
            title="Configuración de Períodos"
            description="Alta y programación de períodos de liquidación."
          />
        </TabsContent>

        <TabsContent value="conceptos">
          <ComingSoonPanel
            title="Conceptos Adicionales"
            description="Catálogo de conceptos adicionales aplicables a los recibos."
          />
        </TabsContent>

        <TabsContent value="deducciones">
          <ComingSoonPanel
            title="Deducciones"
            description="Catálogo de deducciones aplicables a los recibos."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
