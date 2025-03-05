"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { queryClient } from "@/hooks/useQueryClient";
import { ToastProvider } from "@/providers/toast-provider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 p-6 bg-white dark:bg-gray-700">{children}</main>
            </div>
            <ToastProvider />
            <Footer />
          </div>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
