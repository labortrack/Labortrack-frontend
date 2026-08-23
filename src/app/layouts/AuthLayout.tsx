import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page px-4 py-8"><div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-deep via-accent to-sunset" /><div className="pointer-events-none absolute -right-24 -top-24 size-72 rotate-12 bg-primary/[0.035]" /><div className="relative z-10 flex w-full justify-center"><Outlet /></div></main>;
}
