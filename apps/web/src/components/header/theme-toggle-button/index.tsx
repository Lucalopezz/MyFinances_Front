"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export const ThemeToggleButton = () => {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded focus:outline-none"
      aria-label="Toggle theme"
    >
      <Moon className="h-6 w-6 text-gray-700 dark:hidden" />
      <Sun className="hidden h-6 w-6 text-gray-100 dark:block" />
    </button>
  );
};
