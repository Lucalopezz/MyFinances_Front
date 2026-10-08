/**
 * Placeholder sem chamadas à API e sem números financeiros fictícios.
 * Pode ser renderizado no servidor para Suspense/loading.tsx. O texto anuncia
 * a espera com role=status; os blocos decorativos usam aria-hidden para não
 * serem lidos como informações reais por tecnologias assistivas.
 */
export function PrivateLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6" role="status" aria-label="Carregando sua página">
      <p className="text-sm text-slate-600 dark:text-slate-300">Carregando sua página…</p>
      <div aria-hidden className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-28 rounded-lg bg-slate-200 dark:bg-slate-700" />)}
        </div>
        <div className="h-64 rounded-lg bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}
