import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Label } from "@/shared/ui";

interface FormFieldProps {
  id: string;
  label: string;
  icon?: LucideIcon;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({
  id,
  label,
  icon: Icon,
  error,
  hint,
  required,
  children,
}: FormFieldProps) {
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={Icon ? "flex items-center gap-2" : undefined}>
        {Icon && <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />}
        {label}
        {required ? " *" : ""}
      </Label>
      {children}
      {error ? (
        <p id={descriptionId} className="text-xs font-medium text-error">
          {error}
        </p>
      ) : null}
      {!error && hint ? (
        <p id={descriptionId} className="text-xs text-foreground-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
