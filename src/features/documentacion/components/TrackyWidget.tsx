import { lazy, Suspense, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useLocation } from "react-router-dom";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { Spinner, Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";
import { useTrackyChatStore } from "../store/trackyChatStore";
import {
  debeMostrarWidgetTracky,
  indicadorWidgetTracky,
  type IndicadorTracky,
} from "../utils/trackyWidget";
import { estadoAvatarBoton } from "../utils/trackyAvatar";
import { TrackyAvatar } from "./TrackyAvatar";

const cargarPanel = () => import("./TrackyWidgetPanel");
const TrackyWidgetPanel = lazy(cargarPanel);

const ANUNCIOS: Record<IndicadorTracky, string> = {
  inactivo: "",
  pensando: "Tracky está respondiendo…",
  nueva: "Tracky respondió.",
};

/**
 * Acceso flotante a Tracky desde cualquier pantalla de la app. Comparte la conversación
 * con /asistente-virtual (mismo store), donde no se muestra.
 */
export function TrackyWidget() {
  const { pathname } = useLocation();
  return debeMostrarWidgetTracky(pathname) ? <WidgetFlotante /> : null;
}

function WidgetFlotante() {
  // En escritorio el panel no es modal, para seguir usando la pantalla de fondo;
  // en móvil ocupa toda la pantalla y atrapa el foco.
  const esEscritorio = useMediaQuery("(min-width: 640px)");
  const enVuelo = useTrackyChatStore((state) => state.enVuelo);
  const ultimoMensaje = useTrackyChatStore((state) => state.mensajes.at(-1));
  const [abierto, setAbierto] = useState(false);
  // Cursor sobre el botón (no toque): el avatar pasa a atento.
  const [hover, setHover] = useState(false);
  const [tooltipAbierto, setTooltipAbierto] = useState(false);
  const [ultimoIdVisto, setUltimoIdVisto] = useState(() => ultimoMensaje?.id);
  const contenidoRef = useRef<HTMLDivElement>(null);

  const indicador = indicadorWidgetTracky({
    abierto,
    enVuelo,
    ultimoMensaje,
    ultimoIdVisto,
  });

  const cambiarAbierto = (siguiente: boolean) => {
    setAbierto(siguiente);
    setUltimoIdVisto(useTrackyChatStore.getState().mensajes.at(-1)?.id);
  };

  // Empieza con el texto del tooltip, así quien usa control por voz puede nombrar el
  // botón por lo que ve (WCAG 2.5.3).
  const etiqueta =
    indicador === "pensando"
      ? "Preguntale a Tracky (respondiendo…)"
      : indicador === "nueva"
        ? "Preguntale a Tracky (respuesta nueva)"
        : abierto
          ? "Cerrar asistente Tracky"
          : "Preguntale a Tracky";

  return (
    <DialogPrimitive.Root
      open={abierto}
      onOpenChange={cambiarAbierto}
      modal={!esEscritorio}
    >
      {/* Tooltip solo con el panel cerrado. */}
      <Tooltip open={tooltipAbierto && !abierto} onOpenChange={setTooltipAbierto}>
        <TooltipTrigger
          asChild
          // El aria-label ya empieza con el texto del tooltip: sin descripción repetida.
          aria-describedby={undefined}
        >
          <DialogPrimitive.Trigger asChild>
            <button
              type="button"
              aria-label={etiqueta}
              onPointerEnter={(event) => {
                void cargarPanel();
                if (event.pointerType !== "touch") setHover(true);
              }}
              onPointerLeave={() => setHover(false)}
              onFocus={() => void cargarPanel()}
              // Crece el botón entero (avatar y punto) solo con movimiento permitido y en
              // dispositivos con hover; hover: de Tailwind v4 ya incluye @media (hover: hover).
              // El foco con teclado usa el outline global de globals.css.
              className="group fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-[max(1.5rem,env(safe-area-inset-right))] z-30 rounded-full motion-safe:transition-transform motion-safe:duration-150 motion-safe:hover:scale-110 motion-safe:[@media(hover:hover)]:focus-visible:scale-110"
            >
              <TrackyAvatar
                estado={estadoAvatarBoton({ enVuelo, hover: hover && !abierto })}
                // Con el panel abierto, la animación protagonista está en la conversación.
                animado={!abierto}
                className="size-14 shadow-floating transition-shadow group-hover:ring-primary"
              />
              {indicador !== "inactivo" && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute right-0 top-0 size-3.5 rounded-full border-2 border-card",
                    indicador === "pensando"
                      ? "bg-accent motion-safe:animate-pulse"
                      : "bg-error",
                  )}
                />
              )}
            </button>
          </DialogPrimitive.Trigger>
        </TooltipTrigger>
        <TooltipContent side="left">Preguntale a Tracky</TooltipContent>
      </Tooltip>

      <p role="status" className="sr-only">
        {ANUNCIOS[indicador]}
      </p>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          ref={contenidoRef}
          aria-describedby={undefined}
          // El panel enfoca el textarea al terminar de cargar; mientras tanto, el foco
          // queda en el contenedor y no en el primer botón del encabezado.
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            contenidoRef.current?.focus();
          }}
          // Un clic en la pantalla de fondo no cierra el panel: se cierra con Esc,
          // con la X o con el botón flotante.
          onInteractOutside={(event) => event.preventDefault()}
          className="fixed inset-0 z-30 flex flex-col bg-card pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] focus:outline-none sm:inset-auto sm:bottom-24 sm:right-6 sm:w-full sm:max-w-md sm:bg-transparent sm:pb-0 sm:pt-0"
        >
          <DialogPrimitive.Title className="sr-only">
            Tracky, asistente virtual
          </DialogPrimitive.Title>
          <Suspense
            fallback={
              <div className="flex flex-1 items-center justify-center sm:h-[620px] sm:max-h-[calc(100vh-8rem)] sm:flex-none sm:rounded-card sm:border sm:border-border sm:bg-card sm:shadow-floating">
                <Spinner label="Cargando Tracky" />
              </div>
            }
          >
            <TrackyWidgetPanel onClose={() => cambiarAbierto(false)} />
          </Suspense>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
