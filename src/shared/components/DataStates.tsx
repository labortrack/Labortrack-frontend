import type { ReactNode } from "react";
import { AlertCircle, Inbox } from "lucide-react";
import { Button, Spinner } from "@/shared/ui";

export function LoadingState({ label = "Cargando información..." }: { label?: string }) {
  return <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-8 text-sm text-foreground-muted"><Spinner className="size-7" /><span>{label}</span></div>;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="flex min-h-48 flex-col items-center justify-center p-8 text-center"><span className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted"><Inbox className="size-5 text-foreground-muted" /></span><h3 className="font-semibold text-foreground">{title}</h3>{description ? <p className="mt-1 max-w-md text-sm text-foreground-muted">{description}</p> : null}{action ? <div className="mt-4">{action}</div> : null}</div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="flex min-h-48 flex-col items-center justify-center p-8 text-center"><span className="mb-3 flex size-11 items-center justify-center rounded-full bg-error-soft"><AlertCircle className="size-5 text-error" /></span><h3 className="font-semibold text-foreground">No pudimos cargar la información</h3><p className="mt-1 max-w-md text-sm text-foreground-muted">{message}</p>{onRetry ? <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>Reintentar</Button> : null}</div>;
}
