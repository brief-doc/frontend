import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MainLayout } from "../components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Users, FileText, MessageSquare, Cpu, TrendingUp, Power, PowerOff } from "lucide-react";
import toast from "react-hot-toast";
import { getMeAPI, getUsersAPI, resetUserPasswordAPI, forceLogoutUserAPI, toggleUserActivationAPI, getAdminStatsAPI, type AdminStats } from "../api/auth";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  user_login: string | null;
  user_create: string | null;
  user_update: string | null;
  is_deleted: boolean;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [me, setMe] = useState<{ name: string; roles: string[] } | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const userList = await getUsersAPI();

      const formattedUsers: AdminUser[] = userList.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles || [],
        user_login: user.user_login || null,
        user_create: user.user_create || null,
        user_update: user.user_update || null,
        is_deleted: user.is_deleted ?? false,
      }));
      setUsers(formattedUsers);
    } catch (error: any) {
      toast.error(error?.message || "사용자 목록을 불러오지 못했습니다.");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    const checkAdminAccess = async () => {
      const meData = await getMeAPI();
      if (meData?.roles?.includes("관리자")) {
        setIsAdmin(true);
        await loadUsers();
        const stats = await getAdminStatsAPI();
        setAdminStats(stats);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminAccess();
  }, [navigate]);

  useEffect(() => {
    if (isAdmin === false) {
      navigate("/", { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleToggleActivation = async (userId: number, currentStatus: boolean) => {
    console.log(`[DEBUG] Button clicked for User: ${userId}. Current is_deleted state is: ${currentStatus}`);
    setPendingActionId(userId);
    const actionText = currentStatus ? "활성화" : "비활성화";
    try {
      await toggleUserActivationAPI(userId, !currentStatus);
      toast.success(`사용자가 ${actionText}되었습니다.`);
      await loadUsers();
    } catch (error: any) {
      toast.error(error?.message || "상태 변경에 실패했습니다.");
    } finally {
      setPendingActionId(null);
    }
  };


  const handleResetPassword = async (userId: number) => {
    setPendingActionId(userId);
    try {
      await resetUserPasswordAPI(userId);
      toast.success("암호가 초기화되었습니다.");
      await loadUsers();
    } catch (error: any) {
      toast.error(error?.message || "암호 초기화에 실패했습니다.");
    } finally {
      setPendingActionId(null);
    }
  };

  const handleForceLogout = async (userId: number) => {
    setPendingActionId(userId);
    try {
      await forceLogoutUserAPI(userId);
      toast.success("사용자가 로그아웃되었습니다.");
      await loadUsers();
    } catch (error: any) {
      toast.error(error?.message || "로그아웃 처리에 실패했습니다.");
    } finally {
      setPendingActionId(null);
    }
  };

  const roleColors: Record<string, string> = {
    "실무 담당자": "bg-[var(--status-info)] text-white border-transparent",
    "결재권자": "bg-[var(--status-pending)] text-white border-transparent",
    "관리자": "bg-primary text-white border-transparent",
  };

  const CHART_COLORS = ["#2B6E72", "#F59E0B", "#DC2626", "#3B82F6", "#8B5CF6", "#10B981", "#F97316", "#6366F1"];

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-base text-muted-foreground">관리자 인증 중...</p>
      </div>
    );
  }

  if (isAdmin === false) {
    return null;
  }

  return (
    <MainLayout currentUser={me}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-medium text-foreground">관리자 유저관리</h1>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle>사용자 목록</CardTitle>
            <Button onClick={() => navigate("/admin/users/create")}>
              <Users className="size-4" />
              유저 생성
            </Button>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">이름</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">이메일</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">권한</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">상태</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">가입일</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">최종 수정일</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">마지막 로그인</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const roles = user.roles;
                    const joinDate = user.user_create
                      ? new Date(user.user_create).toLocaleDateString("ko-KR")
                      : "생성 기록 없음";
                    const upDate = user.user_update
                      ? new Date(user.user_update).toLocaleDateString("ko-KR")
                      : "수정 기록 없음";
                    const lastActive = user.user_login
                      ? new Date(user.user_login).toLocaleString("ko-KR")
                      : "접속 기록 없음";

                    return (
                      <tr
                        key={user.id}
                        className={`border-b border-border hover:bg-muted/30 cursor-pointer transition-colors ${user.is_deleted ? "opacity-60 bg-muted/20" : ""
                          }`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{user.name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1.5 items-start">
                            {roles.map((role, idx) => (
                              <Badge key={idx} className={roleColors[role]}>{role}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {user.is_deleted ? (
                            <Badge variant="outline" className="text-destructive border-destructive">비활성</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[var(--status-approved)] border-[var(--status-approved)]">활성</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{joinDate}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{upDate}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{lastActive}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          <div className="flex flex-col gap-2 w-32">
                            {/* 1. New Dedicated Activity Redirect Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-primary text-primary hover:bg-primary/10"
                              disabled={user.is_deleted} // Optional: Disable activity view if user is deleted
                              onClick={() => navigate(`/admin/users/${user.id}/activity`)}
                            >
                              유저 활동
                            </Button>
                            {/* Activation/Deactivation Toggle Button */}
                            <Button
                              size="sm"
                              variant={user.is_deleted ? "default" : "destructive"}
                              disabled={pendingActionId === user.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleActivation(user.id, user.is_deleted);
                              }}
                            >
                              {user.is_deleted ? <Power className="size-3 mr-1" /> : <PowerOff className="size-3 mr-1" />}
                              {user.is_deleted ? "활성화" : "비활성화"}
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              disabled={pendingActionId === user.id || user.is_deleted}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResetPassword(user.id);
                              }}
                            >
                              암호 리셋
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={pendingActionId === user.id || user.is_deleted}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleForceLogout(user.id);
                              }}
                            >
                              로그아웃
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}