"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  jwt: string | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [jwt, setJwt] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const res = await fetch("/api/auth/session");
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setJwt(data?.jwt ?? null);
          setStatus(data?.jwt ? "authenticated" : "unauthenticated");
        } else {
          setJwt(null);
          setStatus("unauthenticated");
        }
      } catch (e) {
        setJwt(null);
        setStatus("unauthenticated");
      }
    }
    check();
    return () => {
      mounted = false;
    };
  }, []);

  async function login(email: string, password: string) {
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setStatus("unauthenticated");
        return false;
      }
      // fetch session
      const sessionRes = await fetch("/api/auth/session");
      if (sessionRes.ok) {
        const data = await sessionRes.json();
        setJwt(data?.jwt ?? null);
        setStatus(data?.jwt ? "authenticated" : "unauthenticated");
        return !!data?.jwt;
      }
      setStatus("unauthenticated");
      return false;
    } catch (e) {
      setStatus("unauthenticated");
      return false;
    }
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // ignore
    }
    setJwt(null);
    setStatus("unauthenticated");
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ jwt, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
