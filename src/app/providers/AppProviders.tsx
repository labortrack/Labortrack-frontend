import { useState, type ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { env } from "@/app/config/env";
import { SessionInitializer } from "@/features/auth/components/SessionInitializer";
import { TooltipProvider } from "@/shared/ui";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
          mutations: { retry: 0 },
        },
      }),
  );
  const content = (
    <TooltipProvider delayDuration={300}>
      <SessionInitializer>{children}</SessionInitializer>
      <Toaster position="top-right" richColors closeButton />
    </TooltipProvider>
  );
  return (
    <QueryClientProvider client={queryClient}>
      {env.googleClientId ? (
        <GoogleOAuthProvider clientId={env.googleClientId}>
          {content}
        </GoogleOAuthProvider>
      ) : (
        content
      )}
    </QueryClientProvider>
  );
}
