import { useTheme } from "next-themes";
import { Bell, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 shadow p-4 flex items-center justify-between">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 focus:outline-none"
      >
        <Menu className="w-6 h-6 text-[#1F2937] dark:text-white" />
      </button>

      <div className="text-xl font-bold text-[#1F2937] dark:text-white">
        MyFinances
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative">
          <Bell className="w-6 h-6 text-[#1F2937] dark:text-white" />
          <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-[#EF4444] rounded-full"></span>
        </button>

        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="p-2 rounded focus:outline-none"
        >
          {theme === "light" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#1F2937]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#F9FAFB]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m8-9h1M4 12H3m15.364-6.364l.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z"
              />
            </svg>
          )}
        </button>

        {/* Avatar do usuário */}
        <div className="w-8 h-8 rounded-full bg-[#3B82F6] flex items-center justify-center text-white">
          U
        </div>
      </div>
    </header>
  );
};
