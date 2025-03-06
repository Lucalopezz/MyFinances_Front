export const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", active: true },
    { name: "Transações", active: false },
    { name: "Wishlist", active: false },
    { name: "Despesas Fixas", active: false },
    { name: "Comparativo", active: false },
    { name: "Configurações", active: false },
  ];

  return (
    <aside className="w-64 dark:bg-[#1F2937] dark:text-white p-4 h-full">
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li
              key={item.name}
              className={`py-2 px-4 rounded mb-2 cursor-pointer ${
                item.active
                  ? "bg-[#3B82F6] text-white"
                  : "hover:bg-[#3B82F6]/50 dark:hover:bg-[#3B82F6]/30"
              }`}
            >
              {item.name}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
