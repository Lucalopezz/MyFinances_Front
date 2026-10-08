import { getServerBackendUrl } from "@/lib/backend";

// Cada ping deve chegar à API. Uma resposta estática/cacheada na Vercel poderia
// informar saúde sem gerar o tráfego necessário para acordar a instância Render.
export const dynamic = "force-dynamic";
// Prazo da função de hospedagem, em segundos. É maior que o timeout de I/O
// abaixo para acomodar execução/retorno; depende do deployment/plano da Vercel.
export const maxDuration = 30;

/**
 * Proxy público: navegador -> Next/Vercel -> Nest/Render.
 * BACKEND_URL fica no servidor. Não lemos a sessão nem encaminhamos JWT: o
 * endpoint /health já é público e leve. O browser recebe só 204/503, sem payload.
 */
export async function GET() {
  try {
    const response = await fetch(`${getServerBackendUrl()}/health`, {
      cache: "no-store",
      // O browser permite 22s; o contato com a API usa 20s. O provider decide
      // se haverá outra tentativa, mantendo a rodada limitada.
      signal: AbortSignal.timeout(20_000),
    });
    // Só precisamos do status. Descartar o body libera a resposta sem expor
    // mensagens internas, conteúdo de infraestrutura ou dados no navegador.
    await response.body?.cancel();
    return new Response(null, {
      status: response.ok ? 204 : 503,
      // Impede também o cache da resposta do proxy, não apenas do fetch da API.
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    // Timeout, erro de rede ou configuração ausente seguem o mesmo contrato.
    // O resultado sinaliza reconexão, nunca expiração de JWT ou logout.
    return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
