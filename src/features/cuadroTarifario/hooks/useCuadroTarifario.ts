import { useQuery } from "@tanstack/react-query";
import { categoriaZonaApi } from "../api/categoriaZonaApi";

export const cuadroTarifarioKeys = {
  all: ["cuadroTarifario"] as const,
};

export function useCuadroTarifario() {
  return useQuery({
    queryKey: cuadroTarifarioKeys.all,
    queryFn: () => categoriaZonaApi.obtenerCuadroTarifario(),
  });
}
