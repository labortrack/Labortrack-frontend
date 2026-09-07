import { Building2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/features/auth/hooks/useAuthActions";
import { Button } from "@/shared/ui";

// RF016: si la empresa no fue inicializada, se bloquea el menú general. Un
// usuario no-ADMIN no puede completar el asistente (POST /empresa es ADMIN-only),
// así que solo puede ver este mensaje y esperar a que el administrador lo complete.
export function EmpresaSinInicializar() {
  const navigate = useNavigate();
  const logout = useLogout();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch {
      /* La sesión se limpia en onSettled. */
    }
    navigate("/login", { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-page p-4">
      <div className="max-w-md text-center">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
          <Building2 className="size-6 text-foreground-muted" />
        </span>
        <h1 className="text-2xl font-medium">Cuenta sin empresa asociada</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Su cuenta no está asociada a ninguna empresa. Comuníquese con su
          administrador.
        </p>
        <Button
          variant="outline"
          className="mt-5"
          onClick={handleLogout}
          disabled={logout.isPending}
        >
          <LogOut className="mr-1.5 size-4" />
          Cerrar sesión
        </Button>
      </div>
    </main>
  );
}
