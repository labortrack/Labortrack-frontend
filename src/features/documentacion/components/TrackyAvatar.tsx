import { cn } from "@/shared/utils/cn";
import type { EstadoAvatarTracky } from "../utils/trackyAvatar";

interface TrackyAvatarProps {
  estado?: EstadoAvatarTracky;
  /** En false muestra la pose del estado sin animarla (burbujas respondidas, botón con el panel abierto). */
  animado?: boolean;
  className?: string;
}

/**
 * Avatar de Tracky: cabeza de robot en SVG sobre un círculo claro. Decorativo.
 * La cara de cada estado y sus animaciones (solo con movimiento permitido) están
 * en globals.css, bajo los selectores .lt-tracky[data-estado=…].
 */
export function TrackyAvatar({
  estado = "inactivo",
  animado = true,
  className,
}: TrackyAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary ring-1 ring-inset ring-primary/60",
        className,
      )}
    >
      <svg
        className="lt-tracky size-[64%]"
        data-estado={estado}
        data-animado={animado}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Antena en L: la punta va primero para que el tramo azul la corte recto. */}
        <line className="lt-tracky-punta stroke-accent" x1="8.15" y1="3.65" x2="9.4" y2="3.65" />
        <path d="M12 8V5.15Q12 3.65 10.5 3.65H9.4" strokeLinecap="butt" />
        <g className="lt-tracky-chispas stroke-accent" strokeWidth={1.25}>
          <line x1="14" y1="1.4" x2="14" y2="2.4" />
          <line x1="15.4" y1="2.9" x2="16.2" y2="2.3" />
          <line x1="15.7" y1="4.5" x2="16.8" y2="4.5" />
        </g>
        <rect x="4" y="7.75" width="16" height="12.6" rx="2.5" />
        <rect x="1.5" y="12.25" width="2.5" height="4" rx="0.75" />
        <rect x="20" y="12.25" width="2.5" height="4" rx="0.75" />
        <g className="lt-tracky-cara lt-tracky-cara-inactivo">
          <g className="lt-tracky-ojos">
            <line x1="9" y1="12.6" x2="9" y2="15.4" />
            <line x1="15" y1="12.6" x2="15" y2="15.4" />
          </g>
        </g>
        <g className="lt-tracky-cara lt-tracky-cara-atento">
          <g className="lt-tracky-cejas">
            <path d="M7.9 11.3Q9 10.2 10.1 11" />
            <path d="M13.9 11Q15 10.2 16.1 11.3" />
          </g>
          <line x1="9" y1="13.3" x2="9" y2="15.6" />
          <line x1="15" y1="13.3" x2="15" y2="15.6" />
        </g>
        <g className="lt-tracky-cara lt-tracky-cara-pensando">
          <path d="M7.8 13.4Q9 14.8 10.2 13.4" />
          <path d="M13.8 14.2Q15 12.6 16.2 14.2" />
          <path d="M10.4 17.6Q12.2 16.7 14 16.9" />
        </g>
        <g className="lt-tracky-cara lt-tracky-cara-escribiendo">
          <path d="M7.8 14.4Q9 12.6 10.2 14.4" />
          <path d="M13.8 14.4Q15 12.6 16.2 14.4" />
          <g stroke="none" fill="currentColor">
            <circle className="lt-tracky-punto" cx="9.75" cy="17.6" r="0.95" />
            <circle className="lt-tracky-punto fill-accent" cx="12" cy="17.6" r="0.95" />
            <circle className="lt-tracky-punto" cx="14.25" cy="17.6" r="0.95" />
          </g>
        </g>
      </svg>
    </span>
  );
}
