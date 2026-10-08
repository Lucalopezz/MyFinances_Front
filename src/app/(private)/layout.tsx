import { getCategories } from "@/actions/category/categories";
import { CategoryProvider } from "@/providers/category-provider";
import { AppShell } from "@/components/layout/app-shell";
import { requireAuth } from "@/lib/serverAuth";
import { AuthProvider } from "@/providers/auth-provider";
import { Suspense } from "react";
import { PrivateLoading } from "@/components/layout/private-loading";

/**
 * Isola a leitura assíncrona dentro de Suspense para que o skeleton e os
 * providers globais possam montar enquanto o catálogo aguarda resposta.
 */
async function PrivateShell({ children }: { children: React.ReactNode }) {
  // Categorias são auxiliares ao shell: CategoryProvider recebe undefined em
  // falha e mantém consulta/defaults/tentativa manual. Dados financeiros das
  // páginas continuam com seu próprio tratamento de erro, sem assumir zero.
  const categories = await getCategories().catch(() => undefined);
  return (
    <CategoryProvider initialData={categories}>
      <AppShell>{children}</AppShell>
    </CategoryProvider>
  );
}

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // A proteção vem antes da renderização privada. requireAuth verifica cookie
  // e expiração local do JWT, sem precisar esperar o aquecimento da API.
  await requireAuth();
  // AuthProvider controla a sessão; Suspense controla apenas a espera visual.
  // Nenhum resultado de health check autoriza acesso à área privada.
  return (
    <AuthProvider>
      <Suspense fallback={<PrivateLoading />}>
        <PrivateShell>{children}</PrivateShell>
      </Suspense>
    </AuthProvider>
  );
}
