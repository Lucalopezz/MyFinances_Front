"use client";
import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, useSession } from "next-auth/react";
import { queryClient } from "@/hooks/useQueryClient";
import { ToastProvider } from "@/providers/toast-provider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "next-themes";

function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header onMenuClick={toggleSidebar} />

      <div className="flex flex-1">
        {session && (
          <>
            <div
              className={`fixed md:relative inset-y-0 left-0 z-30 w-64 transform ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              } md:translate-x-0 transition-transform duration-200 ease-in-out`}
            >
              <Sidebar />
            </div>

            {isSidebarOpen && (
              <div
                className="fixed inset-0 z-20 bg-black/50 md:hidden"
                onClick={toggleSidebar}
              />
            )}
          </>
        )}

        <main className="flex-1 p-4 md:p-6 bg-white dark:bg-gray-700">
          {children}
        </main>
      </div>

      <ToastProvider />
      <Footer />
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <Layout>{children}</Layout>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
