"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";

import { makeQueryClient } from "@/hooks/useQueryClient";
import { ToastProvider } from "@/providers/toast-provider";
import { BackendConnectionProvider } from "@/providers/backend-connection-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  // O cliente de queries também é estável entre renderizações. O controle de
  // conexão usa essa instância para recuperar consultas; não cria outro cache.
  const [queryClient] = useState(() => makeQueryClient());

  // O provider de conexão fica dentro de QueryClientProvider (para acessar o
  // cache) e no layout raiz (para atender rotas públicas e privadas). Assim,
  // trocar de página não monta outro aquecimento nem duplica a manutenção.
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <BackendConnectionProvider>{children}</BackendConnectionProvider>
        <ToastProvider />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
