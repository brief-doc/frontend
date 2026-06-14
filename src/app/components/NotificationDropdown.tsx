import { useNavigate } from "react-router";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";

interface Notification {
  id: number;
  message: string;
  time: string;
  unread: boolean;
  link?: string | null;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  count: number;
  onMarkRead?: (id: number) => void;
}

export function NotificationDropdown({
  notifications,
  count,
  onMarkRead,
}: NotificationDropdownProps) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative">
          <Bell className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 size-4 bg-destructive text-white text-xs rounded-full flex items-center justify-center">
              {count}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-3 py-2 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">알림</h3>
            {count > 0 && (
              <Badge variant="secondary" className="text-xs">
                {count} 새 알림
              </Badge>
            )}
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              새로운 알림이 없습니다
            </div>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                className="px-3 py-3 cursor-pointer focus:bg-muted"
                onClick={() => {
                  if (notif.unread) onMarkRead?.(notif.id);
                  if (notif.link) navigate(notif.link);
                }}
              >
                <div className="flex gap-3 w-full">
                  {notif.unread && (
                    <div className="size-2 bg-status-info rounded-full mt-2 shrink-0" />
                  )}
                  <div className={`flex-1 min-w-0 ${!notif.unread ? "pl-5" : ""}`}>
                    <p className="text-sm text-foreground leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notif.time}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
