import type { ReactNode } from "react";

/**
 * Renderiza texto enriquecido parseando sintaxis básica de Markdown:
 * - **negrita** o __negrita__
 * - *cursiva* o _cursiva_
 * - `código en línea`
 * - Listas con viñetas (- elemento o * elemento) y saltos de línea.
 */
export function renderMarkdownText(text: string): ReactNode {
  if (!text) return null;

  // Separar por líneas para soportar párrafos y listas
  const lines = text.split("\n");

  return lines.map((line, lineIndex) => {
    // Lista no ordenada (- o *)
    const isBullet = /^\s*[-*•]\s+(.*)$/.test(line);
    const lineContent = isBullet ? line.replace(/^\s*[-*•]\s+/, "") : line;

    // Parser inline para **bold**, *italic*, `code`
    const parsedInline = parseInlineMarkdown(lineContent);

    if (isBullet) {
      return (
        <div key={lineIndex} className="my-0.5 flex items-start gap-2 pl-2">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
          <span className="flex-1 leading-relaxed">{parsedInline}</span>
        </div>
      );
    }

    return (
      <span key={lineIndex} className="block leading-relaxed min-h-[1.2em]">
        {parsedInline}
      </span>
    );
  });
}

function parseInlineMarkdown(text: string): ReactNode[] {
  // Regex para tokens: **bold**, __bold__, *italic*, _italic_, `code`
  const tokenRegex = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Negrita: **texto** o __texto__
    if (
      (part.startsWith("**") && part.endsWith("**") && part.length >= 4) ||
      (part.startsWith("__") && part.endsWith("__") && part.length >= 4)
    ) {
      const inner = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-foreground">
          {inner}
        </strong>
      );
    }

    // Código en línea: `texto`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={index}
          className="rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-xs font-semibold text-primary"
        >
          {inner}
        </code>
      );
    }

    // Cursiva: *texto* o _texto_
    if (
      (part.startsWith("*") && part.endsWith("*") && part.length >= 2) ||
      (part.startsWith("_") && part.endsWith("_") && part.length >= 2)
    ) {
      const inner = part.slice(1, -1);
      return (
        <em key={index} className="italic">
          {inner}
        </em>
      );
    }

    // Texto plano normal
    return <span key={index}>{part}</span>;
  });
}
