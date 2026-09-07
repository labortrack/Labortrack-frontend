import type { LucideIcon } from "lucide-react";

interface AsistenciaInfoItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function AsistenciaInfoItem({
  icon: Icon,
  label,
  value,
}: AsistenciaInfoItemProps) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-foreground-muted" />
      <div className="min-w-0">
        <span className="block text-xs font-medium text-foreground-muted">
          {label}
        </span>
        <span className="mt-0.5 block text-sm font-semibold text-foreground">
          {value}
        </span>
      </div>
    </div>
  );
}
