import { cn } from "@/shared/utils/cn";

function getInitials(nombre: string): string {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function avatarColor(nombre: string): string {
  const palette = [
    "#0036a4",
    "#004c28",
    "#7c3aed",
    "#0891b2",
    "#b45309",
    "#c0392b",
  ];
  let h = 0;
  for (let i = 0; i < nombre.length; i++) {
    h = nombre.charCodeAt(i) + ((h << 5) - h);
  }
  return palette[Math.abs(h) % palette.length];
}

interface CapatazAvatarProps {
  nombre: string;
  size?: "sm" | "md";
  className?: string;
}

export function CapatazAvatar({
  nombre,
  size = "sm",
  className,
}: CapatazAvatarProps) {
  const dim = size === "sm" ? "size-7 text-[11px]" : "size-9 text-[13px]";

  return (
    <div
      className={cn(
        dim,
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-xs",
        className,
      )}
      style={{ backgroundColor: avatarColor(nombre) }}
    >
      {getInitials(nombre)}
    </div>
  );
}
