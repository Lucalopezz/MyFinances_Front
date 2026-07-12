"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggleButton } from "@/components/header/theme-toggle-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const publicLinks = [
  { href: "/login", label: "Login" },
  { href: "/register", label: "Criar conta" },
];

export function PublicHeader({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const pathname = usePathname();
  const links = isAuthenticated
    ? [{ href: "/dashboard", label: "Meu painel" }]
    : publicLinks;

  return (
    <header className="flex items-center justify-between bg-white p-4 shadow dark:bg-gray-800">
      <Link
        href="/"
        className="text-xl font-bold text-gray-700 dark:text-white"
      >
        MyFinances
      </Link>

      <div className="flex items-center gap-2">
        <nav className="flex items-center gap-1" aria-label="Navegacao publica">
          {links.map((link) => (
            <Button
              key={link.href}
              asChild
              variant={pathname === link.href ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "text-gray-700 dark:text-white",
                pathname !== link.href &&
                  "hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        <ThemeToggleButton />
      </div>
    </header>
  );
}
