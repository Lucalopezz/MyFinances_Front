"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useBackendConnection } from "@/providers/backend-connection-provider";

/**
 * Fronteira de erro do App Router para leituras/renderizações da área privada.
 * Não mostramos error.message, que pode conter detalhes do servidor. reset()
 * é fornecido pelo Next para tentar montar o segmento novamente. Recuperar
 * uma leitura aqui nunca reenvia operações financeiras.
 */
export default function PrivateError({ reset }: { error: Error; reset: () => void }) {
  const { reconnect, recoveryCount, status } = useBackendConnection();
  // Um sucesso ocorrido antes da montagem não deve disparar reset. Apenas uma
  // recuperação nova, observada a partir desta contagem, libera a fronteira.
  const previousRecovery = useRef(recoveryCount);
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    // A recuperação automática pode acontecer enquanto esta tela está aberta.
    // O contador crescente permite reagir uma vez a cada recuperação detectada.
    if (recoveryCount > previousRecovery.current) reset();
    previousRecovery.current = recoveryCount;
  }, [recoveryCount, reset]);

  async function retry() {
    // O feedback de clique é local, mas a Promise da reconexão é global.
    setRetrying(true);
    try {
      if (await reconnect()) {
        // Solicita novos Server Components e libera a fronteira somente após
        // confirmar saúde. Se a API continuar indisponível, mantemos a orientação.
        router.refresh();
        reset();
      }
    } finally {
      // Não deixamos o botão preso depois de uma tentativa que não recuperou.
      setRetrying(false);
    }
  }

  return (
    // Sem rede ou com uma rodada ativa, o botão não inicia uma tentativa extra.
    // Todo texto abaixo permanece simples; erros internos não são renderizados.
    <div className="mx-auto max-w-xl space-y-4 p-6 text-gray-800 dark:text-white">
      <h1 className="text-xl font-semibold">Não foi possível carregar esta página</h1>
      <p role="status" className="text-sm text-gray-600 dark:text-gray-300">
        {status === "checking" ? "Esperando o servidor…"
          : "Tente novamente para carregar seus dados."}
      </p>
      <Button disabled={retrying || status === "checking" || status === "offline"} onClick={() => void retry()}>
        {retrying ? "Aguarde…" : "Tentar novamente"}
      </Button>
    </div>
  );
}
