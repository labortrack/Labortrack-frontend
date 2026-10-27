import { useEffect, useState } from "react";
import { renderMarkdownText } from "./MarkdownText";

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export function Typewriter({
  text,
  speed = 12,
  onComplete,
  className,
}: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [textoPrevio, setTextoPrevio] = useState(text);

  // Si cambia el texto, el tipeo arranca de cero. Se ajusta durante el render y no
  // en el efecto, para no encadenar un render extra (react-hooks/set-state-in-effect).
  if (text !== textoPrevio) {
    setTextoPrevio(text);
    setDisplayedText("");
  }

  useEffect(() => {
    let index = 0;

    if (!text) {
      onComplete?.();
      return;
    }

    const interval = setInterval(() => {
      index++;
      setDisplayedText(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <div className={className}>
      {renderMarkdownText(displayedText)}
      {displayedText.length < text.length && (
        // Cursor fijo: la animación protagonista del tipeo es el avatar "escribiendo".
        <span className="inline-block h-4 w-1.5 bg-primary ml-0.5 align-middle" />
      )}
    </div>
  );
}

