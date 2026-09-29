import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/shared/ui";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  bgGradient?: string;
  borderColor?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  bgGradient = "from-primary/10 via-primary/5 to-transparent",
  borderColor = "border-primary/20",
}: KpiCardProps) {
  return (
    <Card
      className={`relative overflow-hidden border bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow ${borderColor}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${bgGradient} pointer-events-none`}
      />
      <CardContent className="p-4 sm:p-5 flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {subtitle ? (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <div
          className={`p-3 rounded-xl bg-background/80 shadow-xs border border-border/50 ${iconColor}`}
        >
          <Icon className="size-6" />
        </div>
      </CardContent>
    </Card>
  );
}
