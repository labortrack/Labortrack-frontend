import { InitialsAvatar } from "@/shared/components";

interface CapatazAvatarProps {
  nombre: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function CapatazAvatar({
  nombre,
  size = "sm",
  className,
}: CapatazAvatarProps) {
  return <InitialsAvatar name={nombre} size={size} className={className} />;
}
