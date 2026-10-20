/**
 * O worker BullMQ atual depende de processo contínuo e disco compartilhado.
 * Até a migração desse fluxo, a função HTTP da Vercel não registra a fila.
 */
export function exportsAvailable(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.VERCEL !== '1';
}
