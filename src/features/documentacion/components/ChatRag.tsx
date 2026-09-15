import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  SendHorizontal,
  Bot,
  RotateCcw,
  BookOpen,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/utils/cn";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { ChatBubble, ChatSkeleton } from "./ChatBubble";
import { useConsultarChat } from "../hooks/useDocumentacion";
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
  sugerencias?: string[];
}

const SUGERENCIAS_DEFECTO = [
  "¿Cuántos días de licencia por examen me corresponden?",
  "¿Qué establece el Convenio Colectivo sobre horas extras?",
  "¿Cómo solicito un día por mudanza o trámite personal?",
];

export function ChatRag({
  messages: externalMessages,
  isLoading: externalIsLoading,
  onSendMessage,
  onResetChat,
  onFuenteClick,
  placeholder = "Preguntale a Tracky sobre convenios, normativas o documentación...",
  botName = "Tracky",
  className,
  sugerencias = SUGERENCIAS_DEFECTO,
}: ChatRagProps) {
  // Estado local para mensajería
  const [internalMessages, setInternalMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      sender: "bot",
      content:
        "¡Hola! Soy Tracky, tu asistente de Recursos Humanos con Inteligencia Artificial. Podés hacerme consultas sobre normativas de trabajo, convenios colectivos, políticas internas o procedimientos de la empresa indexados en el sistema.",
      timestamp: new Date(),
    },
  ]);

  const [inputVal, setInputVal] = useState("");
  const [latestBotMessageId, setLatestBotMessageId] = useState<string | null>(
    null,
  );

  const consultarMutation = useConsultarChat();
  const isLoading = externalIsLoading ?? consultarMutation.isPending;

  const messages = externalMessages ?? internalMessages;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      return;
    }

    // 1. Añadir el mensaje del usuario al historial
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setInternalMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // 2. Consumo de API (POST /api/v1/chat/consultar)
    try {
      const res = await consultarMutation.mutateAsync(trimmed);
      const botId = `bot-${Date.now()}`;
      setLatestBotMessageId(botId);

      const botMsg: ChatMessage = {
        id: botId,
        sender: "bot",
        content:
          res.respuesta ||
          "No se recibió una respuesta del motor de Inteligencia Artificial.",
        timestamp: new Date(),
        fuentes: res.fuentes,
      };

      setInternalMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const apiErr = normalizeApiError(
        error,
        "No fue posible comunicarse con el asistente virtual Tracky.",
      );
      toast.error(apiErr.message);

      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "bot",
        content: `Ocurrió un error al procesar tu consulta: ${apiErr.message}. Por favor verificá tu conexión o intentá nuevamente en unos instantes.`,
        timestamp: new Date(),
        isError: true,
      };
      setInternalMessages((prev) => [...prev, errorMsg]);
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
    // Auto-ajuste de altura hasta un máximo
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleSelectSugerencia = (sug: string) => {
    setInputVal(sug);
    textareaRef.current?.focus();
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
        {/* Banner informativo y descargo de responsabilidad */}
        <div className="flex items-start gap-2.5 rounded-control border border-border bg-subtle/80 p-3 text-xs text-foreground-muted">
          <AlertCircle className="size-4 shrink-0 text-primary mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-foreground">
              Aviso sobre el uso de Inteligencia Artificial:
            </p>
            <p>
              Tracky genera respuestas automatizadas mediante un motor de Inteligencia Artificial (RAG) basado en los documentos institucionales y convenios cargados. Esta herramienta es de caracter orientativo y no reemplaza el criterio legal o administrativo. Por favor, <strong>verificá siempre las respuestas</strong> y consultá con el área de Recursos Humanos ante trámites formales.
            </p>
          </div>
        </div>

        {/* Mensajes */}
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            enableTypewriter={msg.id === latestBotMessageId}
            onTypewriterComplete={() => setLatestBotMessageId(null)}
            onFuenteClick={onFuenteClick}
          />
        ))}

        {/* Estado de carga / procesando */}
        {isLoading && <ChatSkeleton />}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Sugerencias Rápidas ── */}
      {messages.length <= 2 && sugerencias.length > 0 && (
        <div className="border-t border-border bg-subtle/50 px-4 py-2">
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
            <BookOpen className="size-3 text-primary" />
            Preguntas sugeridas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sugerencias.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSugerencia(sug)}
                className="rounded-control border border-border-strong bg-card px-2.5 py-1 text-left text-xs text-foreground transition-colors hover:border-primary hover:bg-primary-soft hover:text-primary"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

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
              className="w-full resize-none rounded-control border border-border-strong bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-foreground-muted/75 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-subtle"
            />
          </div>

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
