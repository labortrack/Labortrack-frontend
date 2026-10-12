import { useRef, useState, type KeyboardEvent } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";
import { fechaLocal, inicioSemana, sumarDias } from "../utils/jornadaNavigation";
import { formatDate } from "../utils/planTrabajoFormatters";

const diasSemana = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

function primerDiaMes(fecha: string) {
  return `${fecha.slice(0, 7)}-01`;
}

function moverMes(fecha: string, meses: number) {
  const [anio, mes] = fecha.split("-").map(Number);
  return fechaLocal(new Date(anio, mes - 1 + meses, 1, 12));
}

function etiquetaDia(fecha: string) {
  return new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    .format(new Date(`${fecha}T12:00:00`));
}

interface SelectorSemanaProps {
  semana: string;
  onSelect: (semana: string) => void;
}

export function SelectorSemana({ semana, onSelect }: SelectorSemanaProps) {
  const [abierto, setAbierto] = useState(false);
  const [mesVisible, setMesVisible] = useState(() => primerDiaMes(semana));
  const [diaEnFoco, setDiaEnFoco] = useState(semana);
  const botonesDia = useRef(new Map<string, HTMLButtonElement>());
  const hoy = fechaLocal();
  const primerDiaGrilla = inicioSemana(mesVisible);
  const dias = Array.from({ length: 42 }, (_, indice) => sumarDias(primerDiaGrilla, indice));
  const filas = Array.from({ length: 6 }, (_, indice) => dias.slice(indice * 7, indice * 7 + 7));
  const nombreMes = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" })
    .format(new Date(`${mesVisible}T12:00:00`));

  const cambiarApertura = (siguiente: boolean) => {
    if (siguiente) {
      setMesVisible(primerDiaMes(semana));
      setDiaEnFoco(semana);
    }
    setAbierto(siguiente);
  };

  const seleccionar = (fecha: string) => {
    onSelect(inicioSemana(fecha));
    setAbierto(false);
  };

  const navegarMes = (meses: number) => {
    const siguienteMes = moverMes(mesVisible, meses);
    setMesVisible(siguienteMes);
    setDiaEnFoco(siguienteMes);
  };

  const enfocarDia = (fecha: string) => {
    setDiaEnFoco(fecha);
    setMesVisible(primerDiaMes(fecha));
    requestAnimationFrame(() => botonesDia.current.get(fecha)?.focus());
  };

  const manejarTeclado = (event: KeyboardEvent<HTMLButtonElement>, fecha: string) => {
    const desplazamientos: Record<string, number> = {
      ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7,
    };
    let siguiente: string | undefined;
    if (event.key in desplazamientos) siguiente = sumarDias(fecha, desplazamientos[event.key]);
    if (event.key === "Home") siguiente = inicioSemana(fecha);
    if (event.key === "End") siguiente = sumarDias(inicioSemana(fecha), 6);
    if (event.key === "PageUp" || event.key === "PageDown") {
      const cambio = event.key === "PageUp" ? -1 : 1;
      const fechaActual = new Date(`${fecha}T12:00:00`);
      const anio = fechaActual.getFullYear() + (event.ctrlKey ? cambio : 0);
      const mes = fechaActual.getMonth() + (event.ctrlKey ? 0 : cambio);
      const ultimoDia = new Date(anio, mes + 1, 0).getDate();
      siguiente = fechaLocal(new Date(anio, mes, Math.min(fechaActual.getDate(), ultimoDia), 12));
    }
    if (!siguiente) return;
    event.preventDefault();
    enfocarDia(siguiente);
  };

  return (
    <Popover open={abierto} onOpenChange={cambiarApertura}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex min-h-9 items-center gap-2 rounded-control bg-primary-soft px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary-soft/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label={`Seleccionar semana. Del ${formatDate(semana)} al ${formatDate(sumarDias(semana, 6))}`}
        >
          <CalendarDays className="size-4" aria-hidden="true" />
          {formatDate(semana)} al {formatDate(sumarDias(semana, 6))}
          <ChevronDown className="size-3.5" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(21rem,calc(100vw-2rem))] p-3"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          requestAnimationFrame(() => botonesDia.current.get(semana)?.focus());
        }}
      >
        <div className="mb-3 flex items-center justify-between gap-1">
          <div className="flex gap-0.5">
            <button type="button" onClick={() => navegarMes(-12)} aria-label="Año anterior" className="rounded-control p-1.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"><ChevronsLeft className="size-4" /></button>
            <button type="button" onClick={() => navegarMes(-1)} aria-label="Mes anterior" className="rounded-control p-1.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"><ChevronLeft className="size-4" /></button>
          </div>
          <span className="text-sm font-semibold capitalize" aria-live="polite">{nombreMes}</span>
          <div className="flex gap-0.5">
            <button type="button" onClick={() => navegarMes(1)} aria-label="Mes siguiente" className="rounded-control p-1.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"><ChevronRight className="size-4" /></button>
            <button type="button" onClick={() => navegarMes(12)} aria-label="Año siguiente" className="rounded-control p-1.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"><ChevronsRight className="size-4" /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center" aria-hidden="true">
          {diasSemana.map((dia) => <span key={dia} className="py-1 text-[11px] font-semibold text-foreground-muted">{dia}</span>)}
        </div>
        <div role="grid" aria-label="Seleccionar semana de lunes a domingo">
          {filas.map((fila) => {
            const inicioFila = fila[0];
            const seleccionada = inicioFila === semana;
            return (
              <div key={inicioFila} role="row" className={cn("group/semana grid grid-cols-7 gap-0.5 rounded-control", seleccionada && "bg-primary-soft")}>
                {fila.map((fecha) => (
                  <div key={fecha} role="gridcell" aria-selected={seleccionada}>
                    <button
                      ref={(element) => { if (element) botonesDia.current.set(fecha, element); else botonesDia.current.delete(fecha); }}
                      type="button"
                      tabIndex={fecha === diaEnFoco ? 0 : -1}
                      onFocus={() => setDiaEnFoco(fecha)}
                      onKeyDown={(event) => manejarTeclado(event, fecha)}
                      onClick={() => seleccionar(fecha)}
                      aria-label={`${etiquetaDia(fecha)}. Seleccionar semana del ${formatDate(inicioFila)} al ${formatDate(sumarDias(inicioFila, 6))}`}
                      aria-current={fecha === hoy ? "date" : undefined}
                      className={cn(
                        "flex aspect-square w-full items-center justify-center rounded-control text-xs tabular-nums hover:bg-primary-soft focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-primary group-hover/semana:bg-primary-soft",
                        fecha.slice(0, 7) !== mesVisible.slice(0, 7) && "text-foreground-muted",
                        seleccionada && "font-semibold text-primary",
                        fecha === hoy && "ring-1 ring-inset ring-primary",
                      )}
                    >
                      {Number(fecha.slice(-2))}
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
