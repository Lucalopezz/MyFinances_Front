export function CalendarLoading() {
  return (
    <div
      role="status"
      aria-label="Carregando calendário financeiro"
      className="animate-pulse space-y-5"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800"
          />
        ))}
      </div>
      <div className="h-96 rounded-2xl bg-slate-100 dark:bg-slate-800" />
      <span className="sr-only">Carregando calendário financeiro…</span>
    </div>
  );
}
