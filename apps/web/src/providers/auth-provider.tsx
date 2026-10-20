"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction } from "@/actions/login/logout-action";
import { SESSION_EXPIRED_EVENT } from "@/lib/client-auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Mantém a sessão da interface e centraliza logout manual ou disparado por um 401. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("authenticated");
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const isEndingSessionRef = useRef(false);

  const endSession = useCallback(async () => {
    // Várias consultas podem receber 401 juntas. A ref limita a limpeza e a
    // navegação a um único encerramento, antes mesmo de o estado renderizar novamente.
    if (isEndingSessionRef.current) return;
    if (status === "unauthenticated" && pathname === "/login") return;

    isEndingSessionRef.current = true;
    setStatus("unauthenticated");

    // Cancela consultas antes de limpar o cache para que respostas em andamento
    // não repovoem os dados financeiros da sessão encerrada.
    await queryClient.cancelQueries();
    queryClient.clear();

    try {
      await logoutAction();
    } catch (e) {
      // Uma falha na action de logout não interrompe o encerramento local da sessão.
    }

    if (pathname !== "/login") {
      router.replace("/login");
    }

    router.refresh();
    isEndingSessionRef.current = false;
  }, [pathname, router, status, queryClient]);

  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, endSession);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, endSession);
    };
  }, [endSession]);

  return (
    <AuthContext.Provider value={{ status, logout: endSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
