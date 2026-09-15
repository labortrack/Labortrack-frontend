import { Outlet } from "react-router-dom";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { LoadingState } from "@/shared/components";
import { useEmpresaInicializada } from "../hooks/useEmpresa";
import { EmpresaInicializacionOverlay } from "./EmpresaInicializacionOverlay";
import { EmpresaSinInicializar } from "./EmpresaSinInicializar";

// RF016-018: bloquea el menú general hasta que la empresa esté inicializada.
export function EmpresaInicializacionGate() {
  const user = useSessionStore((state) => state.user)!;
  const { data: inicializada, isPending, isError } = useEmpresaInicializada();

  if (isPending) {
    return <LoadingState label="Comprobando configuración de la empresa..." />;
  }

  // Ante una falla de red no bloqueamos la app entera: esto es un gate de UX,
  // no el perímetro de seguridad (eso ya lo resuelve el backend).
  if (isError || inicializada) {
    return <Outlet />;
  }

  if (user.rol !== "ROLE_ADMIN") {
    return <EmpresaSinInicializar />;
  }

  return (
    <>
      <Outlet />
      <EmpresaInicializacionOverlay />
    </>
  );
}
