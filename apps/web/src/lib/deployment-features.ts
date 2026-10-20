/**
 * A Vercel usa download direto; o ambiente local conserva o fluxo com fila.
 */
export function exportsAvailable(
  env: { VERCEL?: string; DISABLE_TRANSACTION_EXPORTS?: string } = {
    VERCEL: process.env.VERCEL,
    DISABLE_TRANSACTION_EXPORTS: process.env.DISABLE_TRANSACTION_EXPORTS,
  },
): boolean {
  return env.DISABLE_TRANSACTION_EXPORTS !== "1";
}

export function exportMode(
  env: { VERCEL?: string } = { VERCEL: process.env.VERCEL },
): "direct" | "queued" {
  return env.VERCEL === "1" ? "direct" : "queued";
}
