import {
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
  Bot,
  RotateCcw,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/utils/cn";
import { setAccessToken } from "@/shared/lib/http/tokenManager";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { ChatBubble, ChatSkeleton } from "./ChatBubble";
import { useTrackyChatStore } from "../store/trackyChatStore";
import type { ChatMessage, RagFuenteCitada } from "../types/ragChat.types";

interface ChatRagProps {
  messages?: ChatMessage[];
  isLoading?: boolean;
  onSendMessage?: (content: string) => void;
  onResetChat?: () => void;
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
  onFuenteClick,
  placeholder = "Preguntale a Tracky sobre convenios, normativas o documentación...",
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

  useEffect(() => {
    verificarVencimiento();
  }, [verificarVencimiento]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed || isLoading) return;

    if (onSendMessage) {
      onSendMessage(trimmed);
      setInputVal("");
      return;
    }

    setInputVal("");

    // POST /api/v1/chat/consultar. La consulta vive en el store: si el usuario cambia
    // de pantalla, la respuesta se agrega igual y no se reenvía al volver.
    const resultado = await enviarPregunta(trimmed);

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
        "flex h-[620px] max-h-[85vh] w-full flex-col overflow-hidden border border-border bg-card shadow-soft",
        className,
      )}
    >
      {/* ── Header del Chat ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-subtle px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-white shadow-soft">
            <Bot className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">{botName}</h3>
              <span className="flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                <span className="size-1.5 rounded-full bg-success animate-pulse" />
                ONLINE
              </span>
            </div>
            <p className="text-xs text-foreground-muted">
              Consultas sobre convenios, normativas y legajos
            </p>
          </div>
        </div>

        {onResetChat && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetChat}
            className="text-xs"
            title="Reiniciar conversación"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Reiniciar</span>
          </Button>
        )}
      </div>

      {/* ── Contenedor de Mensajes (Scrollable) ── */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
        {/* Mensajes */}
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            enableTypewriter={msg.id === latestBotMessageId}
            onTypewriterComplete={() => setTipeoCompletoId(msg.id)}
            onFuenteClick={onFuenteClick}
          />
        ))}

        {/* Estado de carga / procesando */}
        {isLoading && <ChatSkeleton />}

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

          <Button
            type="submit"
            size="md"
            disabled={!inputVal.trim() || isLoading}
            className="h-10 px-4"
            aria-label="Enviar mensaje"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <SendHorizontal className="size-4" />
            )}
            <span className="hidden sm:inline">Enviar</span>
          </Button>
        </form>
        <div className="mt-2 flex flex-col items-center justify-between gap-1 text-[11px] text-foreground-muted sm:flex-row">
          <p className="flex items-center gap-1 text-center sm:text-left">
            <Sparkles className="size-3 text-primary" />
            Tracky es una IA y puede cometer errores. Verificá la información importante en las fuentes citadas.
          </p>
          <p className="shrink-0">
            <kbd className="rounded border border-border bg-muted px-1 text-[10px]">Enter</kbd> enviar · <kbd className="rounded border border-border bg-muted px-1 text-[10px]">Shift+Enter</kbd> línea
          </p>
        </div>
      </div>
    </Card>
  );
}
