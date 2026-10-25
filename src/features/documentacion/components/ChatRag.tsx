import {
  useId,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  SendHorizontal,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/utils/cn";
import { setAccessToken } from "@/shared/lib/http/tokenManager";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { BurbujaPensando, ChatBubble } from "./ChatBubble";
import { TrackyAvatar } from "./TrackyAvatar";
import { useTrackyChatStore } from "../store/trackyChatStore";
import type { ChatMessage, RagFuenteCitada } from "../types/ragChat.types";
import { estadoAvatarTracky, type EstadoAvatarTracky } from "../utils/trackyAvatar";
import {
  ID_BIENVENIDA,
  avatarDeBurbuja,
  esConversacionVacia,
} from "../utils/trackyChatVista";

// Alcance según lo que hoy tiene procesarEnRag en los tipos de documento
// (Higiene y Seguridad e Institucional). Es el único lugar del chat que lo menciona.
const ALCANCE_TRACKY =
  "Te ayudo con normativas, protocolos y documentación institucional de LaborTrack.";

// Solo preguntas con respaldo en lo indexado; hoy, el protocolo de EPP.
const PREGUNTAS_EJEMPLO = ["¿Qué EPP es obligatorio en obra?"];

const TEXTO_ESTADO: Record<EstadoAvatarTracky, string> = {
  inactivo: "Asistente virtual",
  atento: "Asistente virtual",
  pensando: "Pensando…",
  escribiendo: "Escribiendo…",
};

interface ChatRagProps {
  messages?: ChatMessage[];
  isLoading?: boolean;
  onSendMessage?: (content: string) => void;
  onResetChat?: () => void;
  /** Muestra una X en el encabezado; la usa el panel flotante. */
  onClose?: () => void;
  onFuenteClick?: (fuente: RagFuenteCitada) => void;
  placeholder?: string;
  botName?: string;
  className?: string;
}

export function ChatRag({
  messages: externalMessages,
  isLoading: externalIsLoading,
  onSendMessage,
  onResetChat,
  onClose,
  onFuenteClick,
  placeholder = "Escribí tu consulta…",
  botName = "Tracky",
  className,
}: ChatRagProps) {
  const navigate = useNavigate();
  const clearSession = useSessionStore((state) => state.clearSession);

  const internalMessages = useTrackyChatStore((state) => state.mensajes);
  const enVuelo = useTrackyChatStore((state) => state.enVuelo);
  const enviarPregunta = useTrackyChatStore((state) => state.enviarPregunta);
  const verificarVencimiento = useTrackyChatStore(
    (state) => state.verificarVencimiento,
  );

  const [inputVal, setInputVal] = useState("");
  const [tipeoCompletoId, setTipeoCompletoId] = useState<string | null>(null);

  const isLoading = externalIsLoading ?? enVuelo;

  const messages = externalMessages ?? internalMessages;
  // Solo se anima una respuesta que llega con el chat a la vista; las que ya estaban
  // al montar (o llegaron estando en otra pantalla) se muestran completas.
  const [idsAlMontar] = useState(() => new Set(messages.map((m) => m.id)));
  const ultimoBot = messages.findLast((m) => m.sender === "bot");
  const latestBotMessageId =
    ultimoBot &&
    !ultimoBot.isError &&
    !idsAlMontar.has(ultimoBot.id) &&
    ultimoBot.id !== tipeoCompletoId
      ? ultimoBot.id
      : null;
  const estadoAvatar = estadoAvatarTracky({
    visible: true,
    enVuelo: isLoading,
    escribiendo: latestBotMessageId !== null,
  });
  const vacia = esConversacionVacia(messages);

  useEffect(() => {
    verificarVencimiento();
  }, [verificarVencimiento]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const devolverFocoRef = useRef(false);
  const idEjemplos = useId();

  // Al enviar un ejemplo, su botón desaparece y el campo queda deshabilitado mientras
  // Tracky piensa, así que el foco se pierde. Vuelve al campo cuando está listo.
  useEffect(() => {
    if (!isLoading && devolverFocoRef.current) {
      devolverFocoRef.current = false;
      textareaRef.current?.focus();
    }
  }, [isLoading]);

  // Auto-ajuste de altura hasta un máximo. Con el campo vacío mide el placeholder,
  // así no queda cortado en pantallas angostas.
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const ajustarAlto = () => {
      textarea.style.height = "auto";
      // border-box: scrollHeight no incluye el borde, sin sumarlo aparece scroll.
      const borde = textarea.offsetHeight - textarea.clientHeight;
      textarea.style.height = `${Math.min(textarea.scrollHeight + borde, 120)}px`;
    };
    ajustarAlto();
    window.addEventListener("resize", ajustarAlto);
    return () => window.removeEventListener("resize", ajustarAlto);
  }, [inputVal]);

  // Auto-scroll al final con cada nuevo mensaje o estado de carga
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Compartido por el formulario y las preguntas de ejemplo.
  const enviar = async (texto: string) => {
    if (!texto || isLoading) return;

    if (onSendMessage) {
      onSendMessage(texto);
      return;
    }

    // POST /api/v1/chat/consultar. La consulta vive en el store: si el usuario cambia
    // de pantalla, la respuesta se agrega igual y no se reenvía al volver.
    const resultado = await enviarPregunta(texto);

    if (resultado.tipo === "auth") {
      toast.error(resultado.mensaje);
      // Limpiar estado de autenticación y redirigir al login
      setAccessToken(null);
      clearSession();
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } else if (resultado.tipo === "error") {
      toast.error(resultado.mensaje);
    }
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed || isLoading) return;
    setInputVal("");
    void enviar(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputVal(e.target.value);
  };

  return (
    <Card
      className={cn(
        "@container flex h-[620px] max-h-[85vh] w-full flex-col overflow-hidden border border-border bg-card shadow-soft",
        className,
      )}
    >
      {/* ── Encabezado: nombre y estado; el avatar vive en la conversación ── */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-subtle py-2.5 pl-5 pr-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-foreground">{botName}</h3>
          <p className="text-xs text-foreground-muted">{TEXTO_ESTADO[estadoAvatar]}</p>
        </div>

        <div className="flex items-center gap-1">
          {onResetChat && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onResetChat}
                  disabled={vacia}
                  className="size-8"
                  aria-label="Reiniciar conversación"
                >
                  <RotateCcw />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reiniciar conversación</TooltipContent>
            </Tooltip>
          )}
          {onClose && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="size-8"
                  aria-label="Cerrar Tracky"
                >
                  <X />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Cerrar Tracky</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* ── Contenedor de Mensajes (Scrollable) ── */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-5">
        {vacia ? (
          <div className="my-auto flex flex-col items-center gap-2 px-3 py-2 text-center">
            <TrackyAvatar estado={estadoAvatar} className="size-20" />
            <h4 className="mt-3 text-base font-bold text-foreground">¡Hola! Soy {botName}.</h4>
            <p className="max-w-[32ch] text-sm text-foreground-muted">{ALCANCE_TRACKY}</p>
            {PREGUNTAS_EJEMPLO.length > 0 && (
              <>
                <p id={idEjemplos} className="mt-3 text-xs text-foreground-muted">
                  Probá con:
                </p>
                <ul aria-labelledby={idEjemplos} className="flex flex-wrap justify-center gap-2">
                  {PREGUNTAS_EJEMPLO.map((pregunta) => (
                    <li key={pregunta}>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                          devolverFocoRef.current = true;
                          void enviar(pregunta);
                        }}
                        className="rounded-full border border-border-strong bg-card px-3.5 py-1.5 text-[13px] text-foreground transition-colors hover:border-primary hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:opacity-55"
                      >
                        {pregunta}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ) : (
          messages
            .filter((msg) => msg.id !== ID_BIENVENIDA)
            .map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                enableTypewriter={msg.id === latestBotMessageId}
                onTypewriterComplete={() => setTipeoCompletoId(msg.id)}
                onFuenteClick={onFuenteClick}
                avatar={avatarDeBurbuja({
                  enCurso: msg.id === latestBotMessageId,
                  enVuelo: isLoading,
                })}
              />
            ))
        )}

        {/* Consulta en vuelo: ocupa el lugar de la respuesta */}
        {isLoading && <BurbujaPensando />}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input y Barra de Envío Fijada al Fondo ── */}
      <div className="border-t border-border bg-card p-3 sm:p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputVal}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              className="w-full resize-none rounded-control border border-border-strong bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-foreground-muted/75 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-subtle disabled:opacity-60"
            />
          </div>

          {/* Ícono fijo también con la consulta en vuelo: la burbuja "pensando" ya lo indica. */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                size="md"
                disabled={!inputVal.trim() || isLoading}
                className="h-10 px-4"
                aria-label="Enviar mensaje"
              >
                <SendHorizontal className="size-4" />
                <span className="hidden sm:inline">Enviar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Enter para enviar · Shift+Enter para nueva línea</TooltipContent>
          </Tooltip>
        </form>
        <p className="mt-2 flex items-center justify-between gap-3 text-[11px] text-foreground-muted">
          <span className="flex min-w-0 items-center gap-1">
            <Sparkles className="size-3 shrink-0 text-primary" />
            <span className="truncate">Tracky puede equivocarse. Verificá en las fuentes citadas.</span>
          </span>
          {/* Atajos solo con teclado y mouse, y si la tarjeta es ancha (/asistente-virtual). */}
          <span className="hidden shrink-0 pointer-fine:@xl:inline">
            <kbd className="rounded border border-border bg-muted px-1 text-[10px]">Enter</kbd> enviar · <kbd className="rounded border border-border bg-muted px-1 text-[10px]">Shift+Enter</kbd> nueva línea
          </span>
        </p>
      </div>
    </Card>
  );
}
