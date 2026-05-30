"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

import { queryClient } from "@/hooks/useQueryClient";
import { AuthProvider } from "@/providers/auth-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { setClientAuthToken } from "@/lib/client-auth";

export function AppProviders({
  children,
  initialJwt,
}: {
  children: React.ReactNode;
  initialJwt: string | null;
}) {
  setClientAuthToken(initialJwt);

  return (
    <AuthProvider initialJwt={initialJwt}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
          <ToastProvider />
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
