import type { ReactNode } from "react";
import { Building2 } from "lucide-react";
import { Card } from "@/shared/ui";

export function AuthBrand() {
  return <div className="text-center"><div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-primary shadow-soft"><Building2 className="size-8 text-white" strokeWidth={1.75} /></div><h1 className="text-2xl font-medium text-foreground">LaborTrack</h1><p className="mt-1 text-sm font-semibold text-foreground-muted">Control de Personal</p></div>;
}

export function AuthCard({ children, showBrand = true }: { children: ReactNode; showBrand?: boolean }) {
  return <Card className="w-full max-w-[460px] p-7 shadow-floating sm:p-8">{showBrand ? <div className="mb-6"><AuthBrand /></div> : null}{children}</Card>;
}
