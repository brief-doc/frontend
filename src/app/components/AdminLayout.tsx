import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Header } from "./Header";
import { Button } from "./ui/button";
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  UserPlus,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "대시보드",
      path: "/admin/dashboard",
    },
    {
      icon: Users,
      label: "유저 관리",
      path: "/admin/users",
      subItems: [
        { label: "유저 목록", path: "/admin/users" },
        { label: "유저 생성", path: "/admin/users/create" },
      ],
    },
    {
      icon: FileText,
      label: "문서 관리",
      path: "/admin/documents",
    },
    {
      icon: MessageSquare,
      label: "질의 이력",
      path: "/admin/queries",
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <Header userName="박과장" userRole="결재권자 · 관리자" notificationCount={3} />

      <div className="flex">
        <aside
          className={`bg-white border-r border-border transition-all duration-300 ${
            sidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          <div className="sticky top-0">
            <div className="flex items-center justify-end p-4 border-b border-border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="size-4" />
                ) : (
                  <ChevronLeft className="size-4" />
                )}
              </Button>
            </div>

            <nav className="p-3 space-y-1">
              {menuItems.map((item) => (
                <div key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive(item.path)
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="size-5 shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </button>
                  {!sidebarCollapsed && item.subItems && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <button
                          key={subItem.path}
                          onClick={() => navigate(subItem.path)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                            isActive(subItem.path)
                              ? "text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
