"use client";

import { useState } from 'react';
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { Menu, Bell, LogOut, User, Sun, Moon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { NotificationButton } from "./NotificationButton";
import { UserProfileButton } from "./UserProfileButton";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <header className="bg-white dark:bg-gray-800 shadow p-4 flex items-center justify-between">
      <MobileMenuButton onMenuClick={onMenuClick} />
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

const NavigationActions = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex items-center space-x-4">
      <NotificationButton />
      <ThemeToggleButton />
      
      {isAuthenticated ? (
        <AuthenticatedActions onLogout={handleLogout} />
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => (window.location.href = "/login")}
        >
          Login
        </Button>
      )}
    </div>
  );
};

const AuthenticatedActions = ({ onLogout }: { onLogout: () => void }) => (
  <>
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