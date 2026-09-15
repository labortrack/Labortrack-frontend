import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { EstadoAsistencia } from "../types/asistencia.types";

export interface ParteDiarioFiltrosPersistidos {
  fecha?: string;
  obraId?: number;
  cuadrillaId?: number;
  estado?: EstadoAsistencia;
  trabajador?: string;
}

interface ParteDiarioFiltrosState {
  filtrosPorUsuario: Record<string, ParteDiarioFiltrosPersistidos>;
  guardarFiltros: (
    usuarioId: number,
    filtros: ParteDiarioFiltrosPersistidos,
  ) => void;
  limpiarFiltros: (usuarioId: number) => void;
}

export const useParteDiarioFiltrosStore =
  create<ParteDiarioFiltrosState>()(
    persist(
      (set) => ({
        filtrosPorUsuario: {},
        guardarFiltros: (usuarioId, filtros) =>
          set((state) => ({
            filtrosPorUsuario: {
              ...state.filtrosPorUsuario,
              [String(usuarioId)]: filtros,
            },
          })),
        limpiarFiltros: (usuarioId) =>
          set((state) => {
            const filtrosPorUsuario = { ...state.filtrosPorUsuario };
            delete filtrosPorUsuario[String(usuarioId)];
            return { filtrosPorUsuario };
          }),
      }),
      {
        name: "labortrack-parte-diario-filtros",
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  );
