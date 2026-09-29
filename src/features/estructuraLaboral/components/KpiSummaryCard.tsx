import type { ReactNode } from "react";
import { Card, CardContent } from "@/shared/ui";

interface KpiSummaryCardProps {
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number;
  valueColor?: string;
  onClick?: () => void;
}

export function KpiSummaryCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  valueColor = "#1c1b1b",
  onClick,
}: KpiSummaryCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`rounded-[0.5rem] border border-border shadow-soft bg-card ${
        onClick ? "cursor-pointer transition-shadow hover:shadow-floating" : ""
      }`}
    >
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
