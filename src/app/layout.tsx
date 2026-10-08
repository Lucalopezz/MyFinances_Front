import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/providers/app-providers";

// Orçamento de execução para páginas/actions no deployment da Vercel. Leituras
// via backendFetch podem usar duas tentativas de até 15s; o prazo de 60s deixa
// espaço para o restante da renderização. Não modifica a duração do JWT nem
// obriga toda chamada a esperar 60s. /api/health declara seu limite próprio.
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "MyFinances",
  description: "Organize suas finanças",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen antialiased")}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
