import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MainLayout } from "../components/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Users, FileText, MessageSquare, Cpu, TrendingUp, Power, PowerOff } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import toast from "react-hot-toast";
// Added toggleUserActivationAPI to the imports
import { getMeAPI, getUsersAPI, resetUserPasswordAPI, forceLogoutUserAPI, toggleUserActivationAPI, getAdminStatsAPI, type AdminStats } from "../api/auth";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  user_login: string | null;
  user_create: string | null;
  user_update: string | null;
  is_deleted: boolean; // - Expanded to include activation status
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

  // New Toggle Handler
  const handleToggleActivation = async (userId: number, currentStatus: boolean) => {
    console.log(`[DEBUG] Button clicked for User: ${userId}. Current is_deleted state is: ${currentStatus}`);
    setPendingActionId(userId);
    const actionText = currentStatus ? "활성화" : "비활성화";
    try {
      // payload sends the opposite of current is_deleted status
      await toggleUserActivationAPI(userId, !currentStatus);
      toast.success(`사용자가 ${actionText}되었습니다.`);
      await loadUsers();
    } catch (error: any) {
      toast.error(error?.message || "상태 변경에 실패했습니다.");
    } finally {
      setPendingActionId(null);
    }
  };

  const stats = [
    {
      icon: Users,
      label: "전체 사용자 수",
      value: adminStats ? adminStats.total_users.toLocaleString() : (loadingUsers ? "..." : users.length.toString()),
      trend: null,
      trendLabel: "활성 계정",
    },
    {
      icon: FileText,
      label: "총 업로드 문서 수",
      value: adminStats ? adminStats.total_documents.toLocaleString() : "...",
      trend: adminStats ? `+${adminStats.documents_this_month}` : null,
      trendLabel: "이번 달",
    },
    {
      icon: MessageSquare,
      label: "RAG 질의 건수(누적)",
      value: adminStats ? adminStats.total_rag_queries.toLocaleString() : "...",
      trend: adminStats ? `+${adminStats.rag_queries_this_week}` : null,
      trendLabel: "이번 주",
    },
    {
      icon: Cpu,
      label: "로컬 LLM 호출 횟수",
      value: adminStats ? adminStats.total_rag_queries.toLocaleString() : "...",
      trend: adminStats ? `+${adminStats.rag_queries_this_week}` : null,
      trendLabel: "이번 주",
    },
  ];

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

  const categoryData = (adminStats?.category_distribution ?? []).map((item, idx) => ({
    name: item.category,
    value: item.count,
    color: CHART_COLORS[idx % CHART_COLORS.length],
  }));

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
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-medium text-foreground">관리자 대시보드</h1>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-medium text-foreground">
                        {stat.value}
                      </span>
                      {stat.trend && (
                        <div className="flex items-center gap-1 text-xs text-[var(--status-approved)]">
                          <TrendingUp className="size-3" />
                          {stat.trend}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stat.trendLabel}
                    </p>
                  </div>
                  <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <stat.icon className="size-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>문서 카테고리 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {categoryData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  업로드된 문서가 없습니다.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}