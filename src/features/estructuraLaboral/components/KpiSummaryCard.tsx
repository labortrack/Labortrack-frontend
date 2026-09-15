import type { ReactNode } from "react";
import { Card, CardContent } from "@/shared/ui";

interface KpiSummaryCardProps {
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number;
  valueColor?: string;
}

export function KpiSummaryCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  valueColor = "#1c1b1b",
}: KpiSummaryCardProps) {
  return (
    <Card className="rounded-[0.5rem] border border-border shadow-soft bg-card">
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className={`size-10 ${iconBg} rounded-[0.5rem] flex items-center justify-center shrink-0`}
        >
          <div className={iconColor}>{icon}</div>
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted block">
            {label}
          </span>
          <span
            className="text-[22px] font-bold leading-7"
            style={{ color: valueColor }}
          >
            {value}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
