import { LogOut, User, Settings, FileCheck, Home } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { NotificationDropdown } from "./NotificationDropdown";
import { useNavigate } from "react-router";

interface HeaderProps {
  userName?: string;
  userRole?: string;
  notifications?: Array<{
    id: number;
    message: string;
    time: string;
    unread: boolean;
    link?: string;
  }>;
  showUser?: boolean;
  showAdminMenu?: boolean;
  showApproverMenu?: boolean;
  isApproverPage?: boolean;
}

export function Header({
  userName = "사용자",
  userRole = "담당자",
  notifications = [],
  showUser = true,
  showAdminMenu = false,
  showApproverMenu = false,
  isApproverPage = false,
}: HeaderProps) {
  const navigate = useNavigate();
  const notificationCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-medium text-foreground">
          가명정보 처리 자동화
        </h1>
        <Badge
          variant="outline"
          className="bg-muted border-border text-muted-foreground"
        >
          🔒 폐쇄망
        </Badge>
      </div>

      {showUser && (
        <div className="flex items-center gap-2">
          {isApproverPage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/staff/dashboard/approver")}
              className="text-muted-foreground hover:text-foreground"
            >
              <Home className="size-4" />
              실무자 대시보드
            </Button>
          )}

          {showApproverMenu && !isApproverPage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/approver/dashboard")}
              className="text-muted-foreground hover:text-foreground"
            >
              <FileCheck className="size-4" />
              결재건
            </Button>
          )}

          {showAdminMenu && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/dashboard")}
              className="text-muted-foreground hover:text-foreground"
              title="관리자 메뉴"
            >
              <Settings className="size-5" />
            </Button>
          )}

          <NotificationDropdown
            notifications={notifications}
            count={notificationCount}
          />

          <div className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted rounded-md px-2 py-1 transition-colors"
            onClick={() => navigate("/mypage")}
          >
            <span className="text-foreground">
              {userName} · {userRole}
            </span>
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="size-4 text-primary" />
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-5" />
          </Button>
        </div>
      )}
    </header>
  );
}
