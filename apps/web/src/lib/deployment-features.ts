/**
 * Oculta exportações no deploy unificado enquanto não houver worker e
 * armazenamento persistente; o fluxo local continua disponível.
 */
export function exportsAvailable(
  env: { VERCEL?: string } = { VERCEL: process.env.VERCEL },
): boolean {
  return env.VERCEL !== '1';
}
