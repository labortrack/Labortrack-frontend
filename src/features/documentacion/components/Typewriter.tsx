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

  useEffect(() => {
    let index = 0;
    setDisplayedText("");

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
        <span className="inline-block h-4 w-1.5 animate-pulse bg-primary ml-0.5 align-middle" />
      )}
    </div>
  );
}

