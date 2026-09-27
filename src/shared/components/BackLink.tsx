import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/utils/cn";

type BackLinkBaseProps = {
  label?: string;
  className?: string;
};

type BackLinkProps =
  | (BackLinkBaseProps & { to: string; onClick?: never })
  | (BackLinkBaseProps & { onClick: () => void; to?: never });

const backLinkClassName =
  "group mb-3 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-foreground-muted transition-colors hover:text-primary";

const backLinkContent = (label: string) => (
  <>
    <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
    <span>{label}</span>
  </>
);

// Botón/link "Atrás" estándar para la segunda pantalla de un módulo
// (creación, detalle, configuración). Las pantallas principales de cada
// módulo no lo usan.
export function BackLink({ label = "Atrás", className, ...navProps }: BackLinkProps) {
  if (navProps.to) {
    return (
      <Link to={navProps.to} className={cn(backLinkClassName, className)}>
        {backLinkContent(label)}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={navProps.onClick}
      className={cn(backLinkClassName, "cursor-pointer", className)}
    >
      {backLinkContent(label)}
    </button>
  );
}
