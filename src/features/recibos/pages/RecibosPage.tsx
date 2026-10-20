import {
  CalendarClock,
  FileText,
  MinusCircle,
  PlusCircle,
  Table2,
} from "lucide-react";
import { ConceptosAdicionalesTab } from "@/features/conceptoAdicional/components/ConceptosAdicionalesTab";
import { CuadroTarifarioTab } from "@/features/cuadroTarifario/components/CuadroTarifarioTab";
import { DeduccionesTab } from "@/features/deduccion/components/DeduccionesTab";
import { PeriodosLiquidacionTab } from "@/features/periodoLiquidacion/components/PeriodosLiquidacionTab";
import { RecibosSueldoTab } from "@/features/reciboSueldo/components/RecibosSueldoTab";
import { PageHeader } from "@/shared/components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui";

export default function RecibosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Recibos"
        description="Gestión de recibos de sueldo y liquidaciones de haberes."
      />

      <Tabs defaultValue="recibos">
        <TabsList>
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
          <RecibosSueldoTab />
        </TabsContent>

        <TabsContent value="cuadro-tarifario">
          <CuadroTarifarioTab />
        </TabsContent>

        <TabsContent value="periodos">
          <PeriodosLiquidacionTab />
        </TabsContent>

        <TabsContent value="conceptos">
          <ConceptosAdicionalesTab />
        </TabsContent>

        <TabsContent value="deducciones">
          <DeduccionesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
