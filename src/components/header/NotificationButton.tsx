"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { useGetNotifications } from "@/hooks/queries/useNotification";
import { NotificationsType } from "@/interfaces/notification.interface";
import { formatTimeAgo } from "@/utils/formatters";

const NotificationIcon = ({ type }: { type: NotificationsType }) => {
  switch (type) {
    case NotificationsType.ALERT:
      return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
    case NotificationsType.REMINDER:
      return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
    case NotificationsType.INFO:
      return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
    default:
      return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
  }
};

export const NotificationButton = () => {
  const { data: notifications = [], isLoading, isError } = useGetNotifications();
  const [isOpen, setIsOpen] = useState(false);
  console.log(notifications)
  // Contagem de notificações não lidas
  const unreadCount = notifications.filter(notif => !notif.read).length;
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Notificações">
          <Bell className="w-6 h-6 text-gray-700 dark:text-white" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex justify-center items-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden">
          <div className="p-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-medium">Notificações</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                Carregando notificações...
              </div>
            ) : isError ? (
              <div className="p-8 text-center text-gray-500">
                Erro ao carregar notificações.
              </div>
            ) : notifications.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <li 
                    key={notification.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      notification.read ? "opacity-70" : "font-medium"
                    }`}
                  >
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{notification.title}</p>
                        <p className="text-gray-600 dark:text-gray-300">{notification.message}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <NotificationIcon type={notification.type} />
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Não há notificações
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t dark:border-gray-700">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-2 px-4 text-sm text-center text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};