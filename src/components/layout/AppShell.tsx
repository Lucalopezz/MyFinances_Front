"use client";

import { useState } from "react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/header/Header";
import { Sidebar } from "@/components/Sidebar";
import { useAuthContext } from "@/providers/auth-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { status, jwt } = useAuthContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((current) => !current);
  };

  const isAuthenticated = status === "authenticated" && Boolean(jwt);

  return (
    <div className="flex min-h-screen flex-col">
      <Header onMenuClick={toggleSidebar} />

      <div className="flex flex-1">
        {isAuthenticated && (
          <>
            <div
              className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
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

        <main className="flex-1 bg-white p-4 md:p-6 dark:bg-gray-700">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
