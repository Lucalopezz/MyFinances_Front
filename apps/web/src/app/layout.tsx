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
      {/* Durante Suspense, o shell privado ainda não pintou o fundo da página.
          O body já usa a mesma paleta dos layouts público e privado para evitar
          um fundo preto enquanto o catálogo ou os dados estão carregando. */}
      <body className={cn("min-h-screen bg-white text-gray-800 antialiased dark:bg-gray-700 dark:text-white")}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
