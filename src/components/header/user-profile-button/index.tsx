"use client";

import { User } from "lucide-react";

export const UserProfileButton = () => {
  return (
    <button 
      className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white"
      aria-label="User Profile"
    >
      <User className="w-5 h-5" />
    </button>
  );
};