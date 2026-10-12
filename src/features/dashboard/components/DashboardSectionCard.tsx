import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";

interface DashboardSectionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  /** Link a la pantalla completa de la seccion. */
  action?: { label: string; to: string };
  className?: string;
  children: ReactNode;
}

export function DashboardSectionCard({
  icon: Icon,
  title,
  subtitle,
  action,
  className,
  children,
}: DashboardSectionCardProps) {
  return (
    <Card className={className}>
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Icon className="size-4 shrink-0 text-primary" />
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-foreground-muted">{subtitle}</p>
            ) : null}
          </div>
          {action ? (
            <Link
              to={action.to}
              className={cn(
                "shrink-0 text-xs font-semibold text-primary hover:underline",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm",
              )}
            >
              {action.label}
            </Link>
          ) : null}
        </div>
        <div className="mt-4 flex-1">{children}</div>
      </CardContent>
    </Card>
  );
}
