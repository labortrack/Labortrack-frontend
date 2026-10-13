import { fechaLocal, inicioSemana, sumarDias } from "./jornadaNavigation";
import type { MisJornadasRango } from "../types/misJornadas.types";

export type PeriodoMisJornadas = "hoy" | "semana" | "mes" | "rango";

export const periodosMisJornadas: Array<{ value: PeriodoMisJornadas; label: string }> = [
  { value: "hoy", label: "Hoy" },
  { value: "semana", label: "Esta semana" },
  { value: "mes", label: "Este mes" },
  { value: "rango", label: "Rango de fechas" },
];

export function esPeriodoMisJornadas(value: string | null): value is PeriodoMisJornadas {
  return periodosMisJornadas.some((periodo) => periodo.value === value);
}

export function esFechaValida(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const fecha = new Date(`${value}T12:00:00`);
  return !Number.isNaN(fecha.getTime()) && fechaLocal(fecha) === value;
}

export function rangoDelPeriodo(periodo: PeriodoMisJornadas, hoy: string, rango: MisJornadasRango): MisJornadasRango {
  if (periodo === "hoy") return { fechaDesde: hoy, fechaHasta: hoy };
  if (periodo === "semana") {
    const fechaDesde = inicioSemana(hoy);
    return { fechaDesde, fechaHasta: sumarDias(fechaDesde, 6) };
  }
  if (periodo === "mes") {
    const [anio, mes] = hoy.split("-").map(Number);
    return {
      fechaDesde: `${hoy.slice(0, 7)}-01`,
      fechaHasta: fechaLocal(new Date(anio, mes, 0, 12)),
    };
  }
  return rango;
}
