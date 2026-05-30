"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/actions/login/logout-action";
import { setClientAuthToken } from "@/lib/client-auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  jwt: string | null;
  status: AuthStatus;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  children,
  initialJwt,
}: {
  children: React.ReactNode;
  initialJwt: string | null;
}) {
  const [jwt, setJwt] = useState<string | null>(initialJwt);
  const [status, setStatus] = useState<AuthStatus>(
    initialJwt ? "authenticated" : "unauthenticated",
  );
  const router = useRouter();

  useEffect(() => {
    setClientAuthToken(jwt);
  }, [jwt]);

  useEffect(() => {
    setJwt(initialJwt);
    setStatus(initialJwt ? "authenticated" : "unauthenticated");
    setClientAuthToken(initialJwt);
  }, [initialJwt]);

  async function logout() {
    try {
      await logoutAction();
    } catch (e) {
      // ignore
    }
    setJwt(null);
    setStatus("unauthenticated");
    setClientAuthToken(null);
    router.push("/login");
    router.refresh();
  }

  return (
    <AuthContext.Provider value={{ jwt, status, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
