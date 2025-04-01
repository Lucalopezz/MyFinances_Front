"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", path: "/" },
    { name: "Transações", path: "/transactions" },
    { name: "Wishlist", path: "/wishlist" },
    { name: "Despesas Fixas", path: "/fixed-expenses" },
    { name: "Comparativo", path: "/comparative" },
    { name: "Configurações", path: "/config" },
  ];

  return (
    <aside className="w-64 dark:bg-[#1F2937] dark:text-white p-4 h-full">
      <nav>
        <ul>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.name} className="mb-2">
                <Link
                  href={item.path}
                  className={`block py-2 px-4 rounded cursor-pointer ${
                    isActive
                      ? "bg-[#3B82F6] text-white"
                      : "hover:bg-[#3B82F6]/50 dark:hover:bg-[#3B82F6]/30"
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
