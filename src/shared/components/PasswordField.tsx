import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";

export const PasswordField = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { withIcon?: boolean }
>(function PasswordField({ className, withIcon = true, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      {withIcon ? (
        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
      ) : null}
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn(withIcon && "pl-10", "pr-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-control p-1.5 text-foreground-muted hover:bg-muted hover:text-primary"
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        disabled={props.disabled}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
});
