import { AlertTriangle } from "lucide-react";
import { Link, useRouteError } from "react-router-dom";
import { Button } from "@/shared/ui";

export function ErrorPage() {
  const error = useRouteError();
  return (
    <main className="flex min-h-screen items-center justify-center bg-page p-4">
      <div className="max-w-md text-center">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-error-soft">
          <AlertTriangle className="size-6 text-error" />
        </span>
        <h1 className="text-2xl font-medium">No pudimos mostrar esta página</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          {error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado."}
        </p>
        <Button asChild className="mt-5">
          <Link to="/dashboard">Volver al dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
