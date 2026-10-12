import type { TipoDato, ValorReporte } from "../types/reporte.types";

const LOCALE = "es-AR";

const ENTERO = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const DECIMAL = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const PORCENTAJE = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function fecha(iso: string): string {
  const [anio, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
}

export function formatearValor(valor: ValorReporte, tipoDato: TipoDato): string {
  if (valor === null || valor === undefined || valor === "") {
    return "-";
  }
  switch (tipoDato) {
    case "ENTERO":
      return ENTERO.format(Number(valor));
    case "DECIMAL":
      return DECIMAL.format(Number(valor));
    case "PORCENTAJE":
      return `${PORCENTAJE.format(Number(valor))} %`;
    case "FECHA":
      return fecha(String(valor));
    case "FECHA_HORA":
      return `${fecha(String(valor))} ${String(valor).slice(11, 16)}`;
    case "TEXTO":
      return String(valor);
  }
}

export function esNumerico(tipoDato: TipoDato): boolean {
  return tipoDato === "ENTERO" || tipoDato === "DECIMAL" || tipoDato === "PORCENTAJE";
}

/** Texto legible de un valor de enum del backend: "EN_ESPERA" -> "En espera". */
export function formatearEnum(valor: string): string {
  const texto = valor.replaceAll("_", " ").toLowerCase();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function isoLocal(fechaLocal: Date): string {
  const mes = String(fechaLocal.getMonth() + 1).padStart(2, "0");
  const dia = String(fechaLocal.getDate()).padStart(2, "0");
  return `${fechaLocal.getFullYear()}-${mes}-${dia}`;
}

export function hoyIso(): string {
  return isoLocal(new Date());
}

export function inicioDeMesIso(): string {
  const hoy = new Date();
  return isoLocal(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
}
