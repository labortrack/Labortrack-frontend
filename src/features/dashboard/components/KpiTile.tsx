import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/shared/ui";

interface KpiTileProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
}

export function KpiTile({ icon: Icon, label, value, subtitle }: KpiTileProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3.5 p-4 sm:p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-tight tabular-nums text-foreground">
            {value}
          </p>
          <p className="truncate text-xs text-foreground-muted">{label}</p>
          {subtitle ? (
            <p className="truncate text-[11px] text-foreground-muted/80">{subtitle}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
