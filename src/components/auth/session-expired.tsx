"use client";

import { useEffect } from "react";
import { useAuthContext } from "@/providers/auth-provider";

/**
 * Configurações só monta este componente quando getUser retorna null: token
 * ausente ou 401 real. Falhas de rede/5xx lançam erro recuperável, sem chegar
 * aqui e sem encerrar uma sessão que continua válida.
 *
 * O efeito chama logout diretamente. Um evento emitido por um filho durante
 * a montagem poderia preceder a instalação do listener do AuthProvider.
 * O provider já centraliza cookie/cache/navegação e deduplica encerramentos.
 */
export function SessionExpired() {
  const { logout } = useAuthContext();
  useEffect(() => { void logout(); }, [logout]);
  return <p role="status">Sua sessão expirou. Redirecionando para entrar novamente…</p>;
}
