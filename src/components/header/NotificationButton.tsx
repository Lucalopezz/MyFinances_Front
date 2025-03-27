"use client";

import { Bell } from "lucide-react";

export const NotificationButton = () => {
  return (
    <button className="relative" aria-label="Notifications">
      <Bell className="w-6 h-6 text-gray-700 dark:text-white" />
      <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
    </button>
  );
};