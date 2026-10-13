import { useQuery } from "@tanstack/react-query";
import { misJornadasApi } from "../api/misJornadasApi";
import type { MisJornadasRango } from "../types/misJornadas.types";

const misJornadasKeys = {
  all: ["mis-jornadas"] as const,
  list: (rango: MisJornadasRango) => ["mis-jornadas", "list", rango] as const,
  detail: (id: number) => ["mis-jornadas", "detail", id] as const,
};

export function useMisJornadas(rango: MisJornadasRango) {
  return useQuery({
    queryKey: misJornadasKeys.list(rango),
    queryFn: ({ signal }) => misJornadasApi.listar(rango, signal),
  });
}

export function useMiJornadaDetalle(jornadaId: number) {
  return useQuery({
    queryKey: misJornadasKeys.detail(jornadaId),
    queryFn: ({ signal }) => misJornadasApi.detalle(jornadaId, signal),
    enabled: Number.isInteger(jornadaId) && jornadaId > 0,
  });
}
