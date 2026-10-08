// Impede que este módulo de transporte seja importado para o bundle do browser.
// Os consumidores leem o cookie HTTP-only no servidor e montam os headers lá.
import "server-only";

// Prazo POR tentativa de leitura, e não para todas as tentativas somadas.
// O AbortSignal também pode abortar o consumo do body depois de fetch retornar;
// nesse caso, a falha de response.json()/text() será tratada pelo consumidor.
const REQUEST_TIMEOUT_MS = 15_000;

// Repetimos apenas falhas HTTP transitórias de gateway/disponibilidade. 401,
// 403, 404, 429 e 500 são devolvidos para o tratamento específico da action.
const TRANSIENT_STATUSES = new Set([502, 503, 504]);

/**
 * Transporte compartilhado das actions, com recuperação limitada de leituras.
 *
 * Não decide autenticação, mensagem pública, cache de domínio ou revalidação:
 * cada action continua responsável por esses contratos. GET/HEAD permitem uma
 * repetição; gravações são encaminhadas uma única vez, sem política nova de
 * timeout. Perder a resposta de uma gravação não prova que ela não foi aplicada.
 */
export async function backendFetch(url: string, init: RequestInit = {}) {
  // fetch usa GET quando method não foi informado. Normalizar maiúsculas
  // permite reconhecer também chamadas que informem "get" ou "head".
  const method = (init.method ?? "GET").toUpperCase();
  // O retorno direto evita repetir POST/PATCH/DELETE e até métodos desconhecidos.
  // É essencial para não criar duas transações ou confirmar um pagamento de novo.
  if (method !== "GET" && method !== "HEAD") return fetch(url, init);
  const attempts = 2;
  for (let attempt = 0; attempt < attempts; attempt++) {
    // Cada tentativa recebe um prazo novo. Se o chamador forneceu signal,
    // qualquer um dos sinais pode abortar: seu cancelamento ou nosso timeout.
    const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
    const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
    try {
      const response = await fetch(url, { ...init, signal });
      // Antes de repetir um status transitório, descartamos o body que não será
      // usado. Isso libera a resposta anterior sem ler/propagar detalhes internos.
      if (attempt + 1 < attempts && TRANSIENT_STATUSES.has(response.status)) {
        await response.body?.cancel();
        continue;
      }
      return response;
    } catch (error) {
      // Cancelamento explícito do chamador deve ser respeitado imediatamente.
      // Falhas de rede e nosso timeout podem repetir uma vez; a última falha
      // é relançada para createRequestError ou outro tratamento da action.
      if (init.signal?.aborted || attempt + 1 === attempts) throw error;
    }
  }
  // Guarda defensiva: em condições normais, o loop retorna Response ou relança
  // a última exceção. Nunca usamos esse ponto para aumentar o número de tentativas.
  throw new Error("Não foi possível conectar ao servidor.");
}
