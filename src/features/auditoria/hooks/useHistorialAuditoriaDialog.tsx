import { useCallback, useState } from "react";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { HistorialAuditoriaDialog } from "../components/HistorialAuditoriaDialog";

export interface AuditoriaTarget {
  entidad: string;
  id: number;
  titulo: string;
}

/**
 * Hook para gestionar el modal de auditoría en componentes contenedores persistentes.
 * La verificación de rol ("ROLE_ADMIN") se centraliza aquí para todo el flujo.
 */
export function useHistorialAuditoriaDialog() {
  const esAdmin = useSessionStore((state) => state.user?.rol === "ROLE_ADMIN");
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<AuditoriaTarget | null>(null);

  const abrirHistorial = useCallback(
    (entidad: string, id: number, titulo: string) => {
      if (!esAdmin) return;
      setTarget({ entidad, id, titulo });
      setOpen(true);
    },
    [esAdmin],
  );

  const cerrarHistorial = useCallback(() => {
    // Ponemos open en false pero conservamos target para la animación de cierre de Radix
    setOpen(false);
  }, []);

  const renderDialog = useCallback(() => {
    if (!esAdmin || !target) return null;

    return (
      <HistorialAuditoriaDialog
        entidad={target.entidad}
        id={target.id}
        titulo={target.titulo}
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            cerrarHistorial();
          } else {
            setOpen(true);
          }
        }}
      />
    );
  }, [esAdmin, target, open, cerrarHistorial]);

  return {
    esAdmin,
    open,
    target,
    abrirHistorial,
    cerrarHistorial,
    renderDialog,
  };
}
