import { useTheme } from "next-themes";

export const Header = () => {
    const { theme, setTheme } = useTheme();
  
    return (
      <header className="bg-white dark:bg-gray-800 shadow p-4 flex items-center justify-between">
        <div className="text-xl font-bold text-[#1F2937] dark:text-white">Seu SaaS</div>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Pesquisar..."
            className="border border-[#9CA3AF] rounded px-2 py-1 focus:outline-none focus:border-[#3B82F6] bg-white dark:bg-gray-700 dark:text-white"
          />
          <button className="relative">
            <svg
              className="w-6 h-6 text-[#1F2937] dark:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405M15 17a3.5 3.5 0 00-6.518-2.321m6.518 2.321L9 17m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {/* Indicador de notificação */}
            <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-[#EF4444] rounded-full"></span>
          </button>
          {/* Botão para Dark Mode */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="p-2 rounded focus:outline-none"
          >
            {theme === "light" ? (
              // Ícone de lua para ativar o modo dark
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
              // Ícone de sol para ativar o modo light
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
          <div className="w-8 h-8 rounded-full bg-[#3B82F6] flex items-center justify-center text-white">
            U
          </div>
        </div>
      </header>
    );
  };