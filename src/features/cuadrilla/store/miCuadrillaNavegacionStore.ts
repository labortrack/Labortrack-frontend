import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface MiCuadrillaNavegacionState {
  busquedaPorUsuario: Record<string, string>;
  guardarBusqueda: (usuarioId: number, busqueda: string) => void;
}

export const useMiCuadrillaNavegacionStore =
  create<MiCuadrillaNavegacionState>()(
    persist(
      (set) => ({
        busquedaPorUsuario: {},
        guardarBusqueda: (usuarioId, busqueda) =>
          set((state) => ({
            busquedaPorUsuario: {
              ...state.busquedaPorUsuario,
              [String(usuarioId)]: busqueda,
            },
          })),
      }),
      {
        name: "labortrack-mi-cuadrilla-navegacion",
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  );
