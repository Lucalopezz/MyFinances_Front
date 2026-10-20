/**
 * Controle de disponibilidade usado pelo provider global do frontend.
 *
 * Este arquivo não depende de React, DOM ou autenticação. O provider injeta a
 * chamada de saúde, a visibilidade da aba e a situação da rede. Essa separação
 * permite testar o agendamento com relógio e respostas simulados, sem precisar
 * iniciar o Next.js ou acessar uma API real.
 *
 * A finalidade é reduzir a inatividade da API durante o uso e recuperar leituras
 * após uma falha. O controle não renova JWT, não lê cookies e não executa
 * operações financeiras. Uma resposta saudável também não valida a sessão.
 */

// A Render Free pode suspender uma instância após 15 minutos sem tráfego.
// Cinco minutos deixam margem enquanto a aba estiver visível e conectada;
// nenhum timer da página garante execução com o navegador/dispositivo suspenso.
export const BACKEND_PING_INTERVAL_MS = 5 * 60 * 1000;

// O proxy Next espera a API por até 20 segundos. O navegador permite 22 para
// também acomodar o transporte até a Vercel. Esse prazo vale por tentativa,
// não pela rodada inteira, e pode ser afetado pela suspensão da própria aba.
export const BACKEND_PROBE_TIMEOUT_MS = 22_000;

/**
 * checking: há uma rodada de verificação em andamento ou ela ainda vai começar.
 * ready: a última verificação de saúde foi bem-sucedida.
 * offline: o navegador informou ausência de conexão.
 * unavailable: a rodada terminou sem sucesso, mesmo com a rede disponível.
 *
 * recoveryCount aumenta somente quando uma falha detectada é seguida de
 * sucesso. A tela de erro usa esse contador para saber que pode tentar montar
 * a página novamente, sem confundir todo ping saudável com uma recuperação.
 */
export type BackendConnectionState = {
  status: "checking" | "ready" | "offline" | "unavailable";
  recoveryCount: number;
};

// Também é o snapshot do SSR: não consulta navigator/document no servidor e
// fornece um estado inicial estável para a hidratação dos componentes React.
export const INITIAL_CONNECTION_STATE: BackendConnectionState = {
  status: "checking",
  recoveryCount: 0,
};

type ConnectionOptions = {
  // Deve retornar true apenas para uma resposta de saúde considerada válida.
  // Precisa respeitar o signal para que timeout, offline e unmount cancelem I/O.
  probe: (signal: AbortSignal) => Promise<boolean>;
  // Consultadas no momento da decisão, sem guardar uma cópia antiga do DOM.
  isOnline: () => boolean;
  isVisible: () => boolean;
  // A política de atualizar queries/páginas pertence ao provider, não ao timer.
  onRecovery: () => void;
  // A injeção do relógio facilita testes de cinco minutos sem espera real.
  now?: () => number;
};

/**
 * Cria uma instância com um único agendamento e uma única rodada pendente.
 * Navegar entre páginas não deve recriar essa instância: ela é mantida pelo
 * provider do layout raiz. Apenas timestamps e estado de conexão são guardados.
 */
export function createBackendConnection(options: ConnectionOptions) {
  const now = options.now ?? Date.now;

  // O snapshot só recebe um novo objeto em update(). Isso é necessário para
  // useSyncExternalStore: getSnapshot() não pode inventar um objeto a cada leitura.
  let state = INITIAL_CONNECTION_STATE;
  const listeners = new Set<() => void>();

  // active acompanha o ciclo de vida do provider. generation identifica a
  // rodada atual; uma resposta antiga não pode atualizar uma instância reiniciada.
  let active = false;
  let generation = 0;

  // null significa que ainda não há contato/tentativa válido para usar como
  // referência. O último sucesso evita pings desnecessários; a última tentativa
  // limita rajadas de eventos, mesmo quando a conexão ainda não se recuperou.
  let lastSuccess: number | null = null;
  let lastAttempt: number | null = null;

  // É ativado por falha/offline e consumido no próximo sucesso. A primeira
  // abertura saudável do site não precisa atualizar páginas ou refazer queries.
  let needsRecovery = false;

  // timer é o próximo ping, controller cancela a rodada e pending é a Promise
  // compartilhada por chamadas simultâneas de foco, retorno à aba e formulários.
  let timer: ReturnType<typeof setTimeout> | undefined;
  let controller: AbortController | undefined;
  let pending: Promise<boolean> | undefined;

  function update(status: BackendConnectionState["status"], recovered = false) {
    // Publica uma nova referência e avisa os assinantes depois de atualizar
    // todos os campos, para que o React sempre leia um snapshot consistente.
    state = {
      status,
      recoveryCount: state.recoveryCount + (recovered ? 1 : 0),
    };
    listeners.forEach((listener) => listener());
  }

  function clearTimer() {
    // Pode ser chamado mesmo sem timer. Sempre limpamos a referência também,
    // evitando que o próximo agendamento conviva com um ping anterior.
    clearTimeout(timer);
    timer = undefined;
  }

  function schedule() {
    clearTimer();
    // setTimeout permite reagendar após uma conclusão/evento. Ao contrário de
    // um setInterval independente, não precisamos manter ticks enquanto a aba
    // estiver oculta. check() ainda deduplica chamadas caso haja trabalho pendente.
    if (active && options.isVisible() && options.isOnline()) {
      timer = setTimeout(() => void check(), BACKEND_PING_INTERVAL_MS);
    }
  }

  function offline() {
    // Um sucesso recente deixa de ser evidência útil depois de perder a rede.
    // Zeramos também o limite entre tentativas para não atrasar o retorno online.
    needsRecovery = true;
    lastSuccess = null;
    lastAttempt = null;
    generation++;
    // Invalidar a geração ANTES de abortar impede que catch/finally de uma
    // rodada antiga limpe a Promise ou agende timers para uma rodada mais nova.
    controller?.abort();
    controller = undefined;
    pending = undefined;
    clearTimer();
    update("offline");
  }

  async function pause(delay: number, signal: AbortSignal) {
    // Espera cancelável entre tentativas. Resolver ao cancelar, em vez de deixar
    // a Promise pendurada, permite que a rodada chegue à checagem de abort logo.
    await new Promise<void>((resolve) => {
      const finish = () => {
        // Tanto o término normal quanto o aborto removem timer e listener;
        // o signal não fica acumulando callbacks a cada nova tentativa.
        clearTimeout(wait);
        signal.removeEventListener("abort", finish);
        resolve();
      };
      const wait = setTimeout(finish, delay);
      signal.addEventListener("abort", finish, { once: true });
      // Cobre o caso de o cancelamento já ter ocorrido antes da inscrição.
      if (signal.aborted) finish();
    });
  }

  function check(force = false): Promise<boolean> {
    // force ignora apenas as regras de visibilidade/recência/intervalo. Nem um
    // clique manual pode iniciar uma instância desmontada, operar offline ou
    // abrir uma segunda rodada enquanto a primeira está em andamento.
    if (!active) return Promise.resolve(false);
    if (!options.isOnline()) {
      offline();
      return Promise.resolve(false);
    }
    if (pending) return pending;
    if (!force) {
      // Manutenção automática só acontece com a página visível. Se o contato
      // ainda estiver recente, o evento não precisa gerar tráfego adicional.
      if (!options.isVisible()) return Promise.resolve(false);
      if (lastSuccess !== null && now() - lastSuccess < BACKEND_PING_INTERVAL_MS) {
        return Promise.resolve(true);
      }
      // Voltar à aba pode emitir foco e visibilitychange quase juntos. Também
      // limitamos novos disparos por dez segundos após uma tentativa que falhou.
      if (lastAttempt !== null && now() - lastAttempt < 10_000) {
        return Promise.resolve(false);
      }
    }

    clearTimer();
    // O AbortController pertence à rodada inteira. Cada probe combina esse
    // cancelamento com um timeout próprio, criado dentro do loop abaixo.
    lastAttempt = now();
    const run = ++generation;
    controller = new AbortController();
    const signal = controller.signal;
    update("checking");

    pending = (async () => {
      try {
        // Três tentativas: a primeira imediata; as seguintes após 2s e 5s.
        // Com os prazos do proxy, a rodada permite uma espera da ordem de um
        // minuto. Não é polling infinito nem promessa de tempo exato de cold start.
        for (const delay of [0, 2_000, 5_000]) {
          if (delay) await pause(delay, signal);
          // Depois de cada await, verificamos se esta rodada ainda é dona do
          // estado. Uma aba desmontada ou um retorno offline pode tê-la invalidado.
          if (signal.aborted || !active || run !== generation) return false;
          let healthy = false;
          try {
            healthy = await options.probe(
              // Qualquer um dos sinais pode cancelar a requisição: o da rodada
              // por lifecycle/offline, ou o prazo exclusivo desta tentativa.
              AbortSignal.any([signal, AbortSignal.timeout(BACKEND_PROBE_TIMEOUT_MS)]),
            );
          } catch {
            // Falha de transporte/timeout é tratada como indisponibilidade.
            // Não inferimos expiração de sessão e não alteramos dados da conta.
          }
          if (signal.aborted || !active || run !== generation) return false;
          if (healthy) {
            // Guardamos o sucesso antes de notificar assinantes. Só chamamos a
            // recuperação se houve falha anterior; pings normais ficam silenciosos.
            lastSuccess = now();
            const recovered = needsRecovery;
            needsRecovery = false;
            update("ready", recovered);
            if (recovered) options.onRecovery();
            return true;
          }
          needsRecovery = true;
        }
        // A rodada esgotou as tentativas. A UI pode oferecer reconexão manual;
        // o próximo ping de manutenção será agendado em finally, quando cabível.
        update("unavailable");
        return false;
      } finally {
        // Mesmo em erro/cancelamento, apenas a geração atual pode liberar os
        // recursos compartilhados. Uma Promise antiga nunca apaga pending novo.
        if (run === generation) {
          pending = undefined;
          controller = undefined;
          schedule();
        }
      }
    })();
    return pending;
  }

  return {
    // Contrato de store externa consumido por useSyncExternalStore no provider.
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    start() {
      // A montagem inicia a verificação sem bloquear a renderização da página.
      // Se ela for pulada por estar oculta/offline, os eventos retomarão o fluxo.
      active = true;
      void check();
      schedule();
    },
    resume() {
      // O mesmo método trata tanto ocultar quanto reabrir a aba. Na volta,
      // check() decide pela idade do último contato, não pela duração do timer.
      if (!options.isVisible()) {
        clearTimer();
        return;
      }
      void check();
      schedule();
    },
    offline,
    // Usado pelo botão de tentativa e pela preparação de login/cadastro.
    // A Promise pendente continua compartilhada mesmo quando force é true.
    reconnect: () => check(true),
    stop() {
      // Cleanup completo para unmount e para a montagem dupla do Strict Mode.
      // Limpar lastAttempt permite stop/start imediato sem esperar dez segundos;
      // incrementar generation protege contra o resultado da montagem anterior.
      active = false;
      generation++;
      lastAttempt = null;
      controller?.abort();
      pending = undefined;
      controller = undefined;
      clearTimer();
    },
  };
}
