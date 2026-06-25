import { createContext, useContext, type ReactNode } from "react";
import { useNotifications, type NotificationItem } from "../hooks/useNotifications";
import type { NotificationOut } from "../api/notification";

interface NotificationContextValue {
  notifications: NotificationItem[];
  markRead: (id: number) => void;
  latest: NotificationOut | null;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const value = useNotifications();
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotificationContext must be used within NotificationProvider");
  return ctx;
}
