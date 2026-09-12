import { forwardRef, type ComponentProps } from "react";
import {
  Bot,
  User,
  Sparkles,
  FileText,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Skeleton } from "@/shared/ui/skeleton";
import { Typewriter } from "./Typewriter";
import { renderMarkdownText } from "./MarkdownText";
import type { ChatMessage } from "../types/ragChat.types";

export interface ChatBubbleProps extends ComponentProps<"div"> {
  message: ChatMessage;
  enableTypewriter?: boolean;
  onTypewriterComplete?: () => void;
  onFuenteClick?: (fuente: NonNullable<ChatMessage["fuentes"]>[number]) => void;
}

/**
 * ChatBubble: Renderiza burbujas de chat siguiendo las directrices de design.md.
 * - Usuario: Alineada a la derecha, color de fondo primario (--lt-action-primary), texto blanco.
 * - IA (Bot): Alineada a la izquierda, superficie neutra/suave (--lt-surface-subtle / bg-subtle),
 *   con encabezado de bot y chips de fuentes citadas inferiores.
 */
export const ChatBubble = forwardRef<HTMLDivElement, ChatBubbleProps>(
  function ChatBubble(
    {
      message,
      enableTypewriter = false,
      onTypewriterComplete,
      onFuenteClick,
      className,
      ...props
    },
    ref,
  ) {
    const isUser = message.sender === "user";

    if (isUser) {
      return (
        <div
          ref={ref}
          className={cn("flex w-full justify-end gap-3", className)}
          {...props}
        >
          <div className="flex max-w-[90%] flex-col items-end sm:max-w-[85%] md:max-w-[80%] lg:max-w-[75%]">
            <div className="flex items-center gap-1.5 pb-1 text-xs font-medium text-foreground-muted">
              <span>Tú</span>
              <User className="size-3.5" />
            </div>
            <div className="rounded-card rounded-tr-sm bg-primary px-4 py-3 text-sm leading-relaxed text-white shadow-soft select-text">
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
            {message.timestamp && (
              <span className="mt-1 text-[11px] text-foreground-muted">
                {typeof message.timestamp === "string"
                  ? message.timestamp
                  : message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
              </span>
            )}
          </div>
        </div>
      );
    }

    // Bot / IA
    return (
      <div
        ref={ref}
        className={cn("flex w-full justify-start gap-3", className)}
        {...props}
      >
        <div className="flex max-w-[95%] flex-col items-start sm:max-w-[90%] md:max-w-[85%] lg:max-w-[80%]">
          {/* Encabezado Bot */}
          <div className="flex items-center gap-2 pb-1.5 text-xs font-semibold text-primary">
            <div
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-primary",
                message.isError
                  ? "bg-error-soft text-error"
                  : "bg-primary-soft text-primary",
              )}
            >
              <Bot className="size-3.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn(message.isError && "text-error")}>
                {message.isError ? "Error del Asistente" : "Tracky"}
              </span>
              {!message.isError && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                  <Sparkles className="size-2.5" />
                  RAG IA
                </span>
              )}
            </div>
          </div>

          {/* Burbuja Principal */}
          <div
            className={cn(
              "w-full rounded-card rounded-tl-sm border px-4 py-3.5 text-sm leading-relaxed shadow-soft select-text",
              message.isError
                ? "border-error/30 bg-error-soft/30 text-error-strong"
                : "border-border bg-subtle text-foreground",
            )}
          >
            <div>
              {enableTypewriter ? (
                <Typewriter
                  text={message.content}
                  speed={12}
                  onComplete={onTypewriterComplete}
                />
              ) : (
                renderMarkdownText(message.content)
              )}
            </div>

            {/* Chips de Fuentes Citadas (RAG) */}
            {message.fuentes && message.fuentes.length > 0 && (
              <div className="mt-3.5 border-t border-border pt-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground-muted">
                  <FileText className="size-3.5 text-primary" />
                  Fuentes Citadas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {message.fuentes.map((fuente, idx) => (
                    <button
                      key={fuente.id ?? idx}
                      type="button"
                      onClick={() => onFuenteClick?.(fuente)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary-soft hover:text-primary",
                        !onFuenteClick && "cursor-default",
                      )}
                    >
                      <FileText className="size-3 text-foreground-muted" />
                      <span className="max-w-[200px] truncate">{fuente.titulo}</span>
                      {fuente.seccion && (
                        <span className="text-[11px] text-foreground-muted">
                          ({fuente.seccion})
                        </span>
                      )}
                      {fuente.url && (
                        <ExternalLink className="size-3 opacity-60" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timestamp */}
          {message.timestamp && (
            <span className="mt-1 text-[11px] text-foreground-muted">
              {typeof message.timestamp === "string"
                ? message.timestamp
                : message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
            </span>
          )}
        </div>
      </div>
    );
  },
);

/**
 * ChatSkeleton: Esqueleto de carga visual para cuando la IA está procesando la respuesta.
 */
export function ChatSkeleton() {
  return (
    <div className="flex w-full justify-start gap-3">
      <div className="flex max-w-[85%] flex-col items-start sm:max-w-[75%]">
        {/* Encabezado esqueleto */}
        <div className="flex items-center gap-2 pb-1.5">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Cuerpo esqueleto */}
        <div className="w-full space-y-2.5 rounded-card rounded-tl-sm border border-border bg-subtle p-4 shadow-soft">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground-muted">
            <Sparkles className="size-3.5 animate-spin text-primary" />
            <span>Consultando fuentes documentales y generando respuesta...</span>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[92%]" />
          <Skeleton className="h-4 w-[65%]" />

          {/* Esqueleto de chip de fuente citada */}
          <div className="mt-3 border-t border-border pt-3">
            <Skeleton className="mb-2 h-3 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-36 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
