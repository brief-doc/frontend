import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Home, ClipboardList, LayoutDashboard, Users,
  FileText, MessageSquare, LogOut, Bell
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "./ui/button";
// 💡 [수정] TypeScript 가이드에 맞춰 중괄호 { } 를 추가하여 올바르게 임포트합니다.
import { NotificationDropdown } from "./NotificationDropdown";

export function MainLayout({ children, currentUser }: { children: React.ReactNode; currentUser?: any }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. 브라우저 세션에서 직접 현재 유저 정보 가로채기
  const rawData = sessionStorage.getItem('user_session');
  const sessionData = rawData ? JSON.parse(rawData) : null;

  // 💡 [보안 방어] 세션이 없을 때 하단 UI에서 런타임 에러(TypeError)가 나는 것을 방어합니다.
  const roles: string[] = currentUser?.roles ?? sessionData?.roles ?? [];
  const userName = sessionData?.user_name ?? sessionData?.name ?? "";

  const isAdmin = roles.includes("관리자") || roles.includes("admin");
  const isApprover = roles.includes("결재권자") || roles.includes("approver");

  // 🔔 알림 시스템 상태 관리
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "새로운 가명정보 결합 신청서가 접수되었습니다.",
      time: "10분 전",
      unread: true,
      link: "/approver/dashboard",
    },
    {
      id: 2,
      message: "업로드하신 '신규_공모사업_지침' 문서의 요약이 완료되었습니다.",
      time: "1시간 전",
      unread: true,
      link: "/mypage",
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  };

  const handleLogout = () => {
    sessionStorage.clear();
    toast.success("로그아웃 되었습니다.");
    navigate("/", { replace: true });
  };

  // 사이드바 메뉴 바인딩
  const menuItems = [];
  menuItems.push({ icon: Home, label: "실무 대시보드", path: "/staff/dashboard" });

  if (isApprover) {
    menuItems.push({ icon: ClipboardList, label: "결재 관리", path: "/approver/dashboard" });
  }

  if (isAdmin) {
    menuItems.push(
      { icon: LayoutDashboard, label: "관리자 대시보드", path: "/admin/dashboard" },
      { icon: Users, label: "유저 관리", path: "/admin/users" },
      { icon: FileText, label: "문서 관리", path: "/admin/documents" },
      { icon: MessageSquare, label: "질의 이력", path: "/admin/queries" }
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Toaster />

      {/* 1. 좌측 사이드바 영역 */}
      <aside className="w-64 border-r border-border bg-card flex flex-col fixed h-screen">
        <div className="p-6 border-b border-border">
          <span className="font-bold text-lg text-primary tracking-tight">가명정보 가이드 시스템</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 2. 우측 메인 콘텐츠 및 상단 헤더 레이아웃 */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">

        <header className="h-16 border-b border-border bg-card/50 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground font-mono">
              내부 폐쇄망 정보계
            </span>
          </div>

          <div className="flex items-center gap-4">

            {/* 알림 드롭다운 컴포넌트 */}
            <NotificationDropdown
              notifications={notifications}
              count={unreadCount}
              onMarkRead={handleMarkAsRead}
            />

            <div className="h-4 w-px bg-border mx-1" />

            {/* 유저 마이페이지 퀵 메뉴 (세션이 있을 때만 노출하여 런타임 크래시 차단) */}
            {sessionData && (
              <div
                onClick={() => navigate("/mypage")}
                className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                title="마이페이지로 이동"
              >
                <div className="size-7 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">
                  {userName ? userName.substring(0, 1) : "유"}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium block leading-none">{userName}</span>
                  <div className="flex items-center gap-1.5">
                    {roles.map((role, index) => (
                      <span
                        key={index}
                        className="text-sm font-medium block leading-none"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {sessionData && <div className="h-4 w-px bg-border mx-1" />}

            {/* 로그아웃 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive gap-1.5"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">로그아웃</span>
            </Button>
          </div>
        </header>

        {/* 3. 본문 구역 */}
        <main className="flex-1 p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}