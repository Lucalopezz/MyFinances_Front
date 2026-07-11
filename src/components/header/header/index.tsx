"use client";
import useAuth from "@/hooks/useAuth";
import { Menu, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggleButton } from "../theme-toggle-button";
import { NotificationButton } from "../notification-button";
import { UserProfileButton } from "../user-profile-button";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { status } = useAuth();
  const isAuthenticated = status === "authenticated";

  return (
    <header className="bg-white dark:bg-gray-800 shadow p-4 flex items-center justify-between">
      {isAuthenticated ? (
        <MobileMenuButton onMenuClick={onMenuClick} />
      ) : (
        <div className="md:hidden w-10" />
      )}
      <LogoSection />
      <NavigationActions isAuthenticated={isAuthenticated} />
    </header>
  );
};

const MobileMenuButton = ({ onMenuClick }: { onMenuClick: () => void }) => (
  <button
    onClick={onMenuClick}
    className="md:hidden p-2 focus:outline-none"
    aria-label="Toggle mobile menu"
  >
    <Menu className="w-6 h-6 text-gray-700 dark:text-white" />
  </button>
);

const LogoSection = () => (
  <div className="text-xl font-bold text-gray-700 dark:text-white">
    MyFinances
  </div>
);

const NavigationActions = ({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex items-center space-x-4">
      <ThemeToggleButton />

      {isAuthenticated && <AuthenticatedActions onLogout={handleLogout} />}
    </div>
  );
};

const AuthenticatedActions = ({ onLogout }: { onLogout: () => void }) => (
  <>
    <NotificationButton />
    <UserProfileButton />
    <Button
      variant="ghost"
      size="icon"
      onClick={onLogout}
      className="text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
      aria-label="Logout"
    >
      <LogOut className="w-5 h-5" />
    </Button>
  </>
);
