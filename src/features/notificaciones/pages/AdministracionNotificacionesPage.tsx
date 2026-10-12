import { PageHeader } from "@/shared/components";
import { AvisoGlobalCard } from "../components/AvisoGlobalCard";
import { ConfiguracionNotificacionesCard } from "../components/ConfiguracionNotificacionesCard";

export default function AdministracionNotificacionesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Administración de notificaciones"
        description="Configurá qué eventos notifican a los usuarios y enviá avisos globales."
      />
      <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
        <ConfiguracionNotificacionesCard />
        <AvisoGlobalCard />
      </div>
    </div>
  );
}
