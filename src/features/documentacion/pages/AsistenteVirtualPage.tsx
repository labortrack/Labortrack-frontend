import { PageHeader } from "@/shared/components";
import { ChatRag } from "@/features/documentacion/components/ChatRag";
import { useTrackyChatStore } from "@/features/documentacion/store/trackyChatStore";

export default function AsistenteVirtualPage() {
  const limpiar = useTrackyChatStore((state) => state.limpiar);

  return (
    <div className="flex h-[calc(100vh-125px)] flex-col space-y-4">
      <PageHeader
        title="Asistente Virtual"
        description="Consultá a Tracky sobre normativas, protocolos y documentación institucional de LaborTrack."
      />

      <div className="flex-1 min-h-0 w-full">
        <ChatRag className="h-full max-h-none" onResetChat={limpiar} />
      </div>
    </div>
  );
}

