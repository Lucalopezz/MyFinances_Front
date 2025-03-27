"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export const ThemeToggleButton = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded focus:outline-none"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-6 w-6 text-gray-700" />
      ) : (
        <Sun className="h-6 w-6 text-gray-100" />
      )}
    </button>
  );
};