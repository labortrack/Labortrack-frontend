import { useEffect, useRef } from "react";
import { useTrackyChatStore } from "../store/trackyChatStore";
import { ChatRag } from "./ChatRag";

interface TrackyWidgetPanelProps {
  onClose: () => void;
}

/** Contenido del panel flotante. Se carga en diferido al abrir el widget. */
export default function TrackyWidgetPanel({ onClose }: TrackyWidgetPanelProps) {
  const limpiar = useTrackyChatStore((state) => state.limpiar);
  const contenedorRef = useRef<HTMLDivElement>(null);

  // Con una consulta en vuelo el textarea está deshabilitado y el foco sigue en el panel.
  useEffect(() => {
    contenedorRef.current?.querySelector("textarea")?.focus();
  }, []);

  return (
    <div ref={contenedorRef} className="flex min-h-0 flex-1 flex-col">
      <ChatRag
        onResetChat={limpiar}
        onClose={onClose}
        className="h-full max-h-none flex-1 rounded-none border-0 shadow-none sm:h-[620px] sm:max-h-[calc(100vh-8rem)] sm:flex-none sm:rounded-card sm:border sm:shadow-floating"
      />
    </div>
  );
}
