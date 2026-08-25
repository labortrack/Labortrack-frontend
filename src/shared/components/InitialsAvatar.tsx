import { cn } from "@/shared/utils/cn";

export function getInitials(nombre: string): string {
  if (!nombre) return "";
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const AVATAR_PALETTE = [
  "#0036a4",
  "#004c28",
  "#7c3aed",
  "#0891b2",
  "#b45309",
  "#c0392b",
  "#4f46e5",
  "#059669",
  "#d97706",
  "#db2777",
];

export function getAvatarColor(seed: string): string {
  if (!seed) return AVATAR_PALETTE[0];
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = seed.charCodeAt(i) + ((h << 5) - h);
  }
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

export interface InitialsAvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses: Record<NonNullable<InitialsAvatarProps["size"]>, string> = {
  xs: "size-6 text-[10px]",
  sm: "size-7 text-[11px]",
  md: "size-9 text-[13px]",
  lg: "size-11 text-base",
};

export function InitialsAvatar({
  name,
  size = "sm",
  className,
}: InitialsAvatarProps) {
  const initials = getInitials(name);
  const color = getAvatarColor(name);

  return (
    <div
      className={cn(
        sizeClasses[size],
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-xs select-none",
        className,
      )}
      style={{ backgroundColor: color }}
      title={name}
      aria-label={name}
    >
      {initials || "•"}
    </div>
  );
}
