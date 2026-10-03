export function LoadingState() {
  return (
    <div className="grid min-h-64 w-full place-items-center" role="status">
      <div className="flex h-24 w-full max-w-80 items-center justify-center rounded-xl border bg-[#F3F4F6] dark:bg-[#1F2937]">
        <div
          className="size-12 animate-spin rounded-full border-4 border-[#10B981] border-t-transparent"
          aria-hidden="true"
        />
        <span className="sr-only">Carregando...</span>
      </div>
    </div>
  );
}
