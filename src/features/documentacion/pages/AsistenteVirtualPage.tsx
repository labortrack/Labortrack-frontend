import { PageHeader } from "@/shared/components";
import { ChatRag } from "@/features/documentacion/components/ChatRag";

export default function AsistenteVirtualPage() {
  return (
    <div className="flex h-[calc(100vh-125px)] flex-col space-y-4">
      <PageHeader
        title="Asistente Virtual"
        description="Consultas inteligentes sobre convenios colectivos, normativas internas y documentación de Recursos Humanos."
      />

      <div className="flex-1 min-h-0 w-full">
        <ChatRag className="h-full max-h-none" />
      </div>
    </div>
  );
}

