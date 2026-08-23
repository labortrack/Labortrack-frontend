import type { ReactNode } from "react";
import { Label } from "@/shared/ui";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({
  id,
  label,
  error,
  hint,
  required,
  children,
}: FormFieldProps) {
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
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
