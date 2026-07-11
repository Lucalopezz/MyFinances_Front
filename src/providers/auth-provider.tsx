"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { logoutAction } from "@/actions/login/logout-action";
import { SESSION_EXPIRED_EVENT } from "@/lib/client-auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("authenticated");
  const router = useRouter();
  const pathname = usePathname();
  const isEndingSessionRef = useRef(false);

  const endSession = useCallback(async () => {
    if (isEndingSessionRef.current) return;
    if (status === "unauthenticated" && pathname === "/login") return;

    isEndingSessionRef.current = true;
    setStatus("unauthenticated");

    try {
      await logoutAction();
    } catch (e) {
      // ignore
    }

    if (pathname !== "/login") {
      router.replace("/login");
    }

    router.refresh();
    isEndingSessionRef.current = false;
  }, [pathname, router, status]);

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
