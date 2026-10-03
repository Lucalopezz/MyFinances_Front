"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Transações", path: "/transactions" },
    { name: "Cartões", path: "/cards" },
    { name: "Calendário", path: "/calendar" },
    { name: "Wishlist", path: "/wishlist" },
    { name: "Despesas Fixas", path: "/fixed-expenses" },
    { name: "Comparativo", path: "/comparative" },
    { name: "Configurações", path: "/config" },
  ];

  return (
    <aside className="h-full w-64 overflow-y-auto bg-white p-4 text-slate-900 dark:bg-[#1F2937] dark:text-white">
      <nav aria-label="Navegação principal">
        <ul>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.name} className="mb-2">
                <Link
                  href={item.path}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={`block py-2 px-4 rounded cursor-pointer ${
                    isActive
                      ? "bg-[#3B82F6] text-white"
                      : "bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:bg-[#1F2937] dark:text-slate-200 dark:hover:bg-blue-950 dark:hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
