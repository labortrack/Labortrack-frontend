import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/shared/components";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { JornadasExplorer } from "../components/JornadasExplorer";

export default function JornadasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const usuario = useSessionStore((state) => state.user!);
  const storageKey = `labortrack-jornadas-${usuario.idUsuario}`;
  const query = searchParams.toString();

  useEffect(() => {
    if (!query) {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) setSearchParams(new URLSearchParams(saved), { replace: true });
    } else {
      sessionStorage.setItem(storageKey, query);
    }
  }, [query, setSearchParams, storageKey]);

  return (
    <div className="space-y-6">
      <PageHeader title="Jornadas" description="Consultá la planificación y el estado de las jornadas dentro de tu alcance." />
      <JornadasExplorer rrhh={usuario.rol === "ROLE_RRHH"} />
    </div>
  );
}
