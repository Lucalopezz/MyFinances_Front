"use client";

/**
 * Integra o controle de disponibilidade com React, eventos do navegador e UI.
 * A lógica de timers/tentativas fica em backend-connection.ts; aqui definimos
 * como consultar a saúde e o que atualizar depois de uma recuperação.
 *
 * Este provider é global e não decide se o usuário está autenticado. Os avisos
 * de conexão não encerram sessão, não limpam dados e não explicam infraestrutura
 * na interface. Autenticação continua com middleware/layout/AuthProvider.
 */
import {
  createContext, useContext, useEffect, useRef, useState, useSyncExternalStore,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createBackendConnection, INITIAL_CONNECTION_STATE, type BackendConnectionState,
} from "@/lib/backend-connection";

type ConnectionContext = BackendConnectionState & {
  // Tentativa explícita; mesmo assim compartilha uma rodada já em andamento.
  reconnect: () => Promise<boolean>;
  // Preparação de login/cadastro: usa o estado saudável conhecido ou aguarda
  // uma rodada. Não renova token nem garante a execução da operação seguinte.
  ensureReady: () => Promise<boolean>;
};
const BackendContext = createContext<ConnectionContext | undefined>(undefined);

export function BackendConnectionProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  // A conexão permanece a mesma ao navegar. A ref permite que o callback da
  // primeira montagem leia a rota atual, sem guardar um pathname antigo na closure.
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  // A inicialização preguiçosa mantém uma única instância entre renderizações.
  // As funções abaixo só leem DOM/navigator quando executadas no client; criar
  // o objeto durante SSR não inicia requisições nem consulta o navegador.
  const [connection] = useState(() => createBackendConnection({
    // onLine é um sinal local de rede; apenas a resposta de probe confirma
    // disponibilidade. Ter internet não garante que a API esteja respondendo.
    isOnline: () => navigator.onLine,
    isVisible: () => document.visibilityState === "visible",
    probe: async (signal) => {
      // O browser chama o proxy Next. BACKEND_URL é resolvida no servidor, e
      // o proxy encaminha GET /health sem JWT. no-store exige contato novo;
      // signal transporta os cancelamentos de timeout, offline e desmontagem.
      const response = await fetch("/api/health", { cache: "no-store", signal });
      // 204 é o contrato do proxy. Um HTML com status 200 não deve ser tomado
      // como a confirmação de saúde que estamos esperando.
      return response.status === 204;
    },
    onRecovery: () => {
      // Refaz apenas queries observadas por componentes montados e que acabaram
      // em erro. Não repete mutations nem limpa o cache/dados da conta.
      void queryClient.refetchQueries({
        type: "active",
        predicate: (query) => query.state.status === "error",
      });
      // Nem todos os dados de Server Components vivem no QueryClient. Na área
      // privada, refresh solicita uma nova leitura sem um reload completo do
      // navegador; o React preserva o estado client que consegue manter montado.
      // Páginas públicas não precisam dessa leitura financeira adicional.
      if (!["/", "/login", "/register"].includes(pathnameRef.current)) {
        router.refresh();
      }
    },
  }));
  // Assina a store sem copiar seus campos para outro estado React. O terceiro
  // argumento oferece um snapshot SSR/hidratação estável, sem depender do DOM.
  // subscribe fornece cleanup; getSnapshot só muda de referência em update().
  const state = useSyncExternalStore(
    connection.subscribe, connection.getSnapshot, () => INITIAL_CONNECTION_STATE,
  );
  const [showConnecting, setShowConnecting] = useState(false);

  useEffect(() => {
    // A manutenção começa após montar no navegador. start/stop também suportam
    // o ciclo extra de montagem/cleanup que o React Strict Mode faz no dev.
    connection.start();
    const resume = () => connection.resume();
    const offline = () => connection.offline();
    // visibilitychange cobre ocultar/mostrar a aba; focus cobre voltar à janela;
    // pageshow inclui restauração pelo histórico/bfcache. Todos usam resume(),
    // que verifica recência e compartilha uma rodada já iniciada.
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("focus", resume);
    window.addEventListener("pageshow", resume);
    // Offline cancela a rodada e invalida o sucesso anterior. Online permite
    // retomar com a aba visível, sem criar uma política separada de tentativa.
    window.addEventListener("online", resume);
    window.addEventListener("offline", offline);
    return () => {
      // Removemos exatamente os handlers inscritos e cancelamos timers/I/O.
      // Não ficam listeners duplicados depois de unmount ou Strict Mode.
      connection.stop();
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("focus", resume);
      window.removeEventListener("pageshow", resume);
      window.removeEventListener("online", resume);
      window.removeEventListener("offline", offline);
    };
  }, [connection]);

  useEffect(() => {
    // Pings rápidos ficam silenciosos: o aviso só aparece após 1,5s de espera.
    // Mudar de estado cancela o atraso visual da rodada anterior.
    setShowConnecting(false);
    if (state.status !== "checking") return;
    const timer = setTimeout(() => setShowConnecting(true), 1_500);
    return () => clearTimeout(timer);
  }, [state.status]);

  // Offline/falha final aparecem imediatamente. Só o estado checking respeita
  // o atraso, e nenhum aviso bloqueia children ou explica detalhes internos.
  const showStatus = state.status === "offline" || state.status === "unavailable"
    || (state.status === "checking" && showConnecting);

  return (
    // ensureReady lê o snapshot atual no momento do submit, em vez de usar o
    // status capturado por uma renderização anterior. Se já existe uma rodada,
    // reconnect devolve a mesma Promise para todos os consumidores.
    <BackendContext.Provider value={{
      ...state,
      reconnect: connection.reconnect,
      ensureReady: () => connection.getSnapshot().status === "ready"
        ? Promise.resolve(true) : connection.reconnect(),
    }}>
      {children}
      {showStatus && (
        <div role="status" aria-live="polite" className="fixed inset-x-3 bottom-4 z-[100] mx-auto flex max-w-lg items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-800 shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white">
          {state.status === "checking"
            ? <LoaderCircle aria-hidden className="h-5 w-5 shrink-0 animate-spin" />
            : <WifiOff aria-hidden className="h-5 w-5 shrink-0" />}
          <p className="flex-1">
            {state.status === "offline" ? "Você está sem conexão."
              : state.status === "checking" ? "Esperando o servidor…"
                : "Não foi possível continuar agora. Tente novamente."}
          </p>
          {state.status === "unavailable" && (
            <Button size="sm" variant="outline" className="border-gray-300 bg-white text-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700" onClick={() => void connection.reconnect()}>
              Tentar novamente
            </Button>
          )}
        </div>
      )}
    </BackendContext.Provider>
  );
}

export function useBackendConnection() {
  // Hook público para formulários e fronteira de erro. Contexto ausente indica
  // problema de composição do código, não uma falha de disponibilidade da API.
  const context = useContext(BackendContext);
  if (!context) throw new Error("BackendConnectionProvider ausente");
  return context;
}
