import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder sem chamadas à API e sem números financeiros fictícios.
 * Pode ser renderizado no servidor para Suspense/loading.tsx. O texto anuncia
 * a espera com role=status; os blocos decorativos usam aria-hidden para não
 * serem lidos como informações reais por tecnologias assistivas.
 */
export function PrivateLoading() {
  return (
    // O fallback pode aparecer antes de AppShell: define sua cor de texto e usa
    // cinzas da aplicação. Skeleton mantém a animação/estrutura do componente
    // base, com superfícies cinza-200 no claro e cinza-800 no escuro.
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6 text-gray-800 dark:text-white" role="status" aria-label="Carregando sua página">
      <p className="text-sm text-gray-600 dark:text-gray-300">Carregando sua página…</p>
      <div aria-hidden className="space-y-6">
        <Skeleton className="h-8 w-48 bg-gray-200 dark:bg-gray-800" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => <Skeleton key={item} className="h-28 rounded-lg bg-gray-200 dark:bg-gray-800" />)}
        </div>
        <Skeleton className="h-64 rounded-lg bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}
